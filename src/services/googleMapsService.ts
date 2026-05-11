import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../firebase";
import type { DriverData } from "./firebaseService";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';

// Fix leaflet default icon issue
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

export const BAHRAIN_CENTER = { lat: 26.0667, lng: 50.5577 };
export const BAHRAIN_BOUNDS = {
  north: 26.35,
  south: 25.95,
  west: 50.35,
  east: 50.85,
};
const DEFAULT_ZOOM = 11;

let demoSafeModeEnabled = false;
let demoMovementStopFn: (() => void) | null = null;

export function loadGoogleMapsScript() {
  return Promise.resolve();
}

export async function initializeMap(
  container: HTMLDivElement,
  options?: { center?: { lat: number; lng: number }; zoom?: number },
) {
  const map = L.map(container, {
    center: options?.center ?? BAHRAIN_CENTER,
    zoom: options?.zoom ?? DEFAULT_ZOOM,
    zoomControl: false,
    attributionControl: false,
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors',
  }).addTo(map);

  return map;
}

export function getUserLocation() {
  return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  });
}

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export async function findNearestDrivers(
  pickupLocation: { lat: number; lng: number },
  limit = 3,
) {
  const driversRef = collection(db, "drivers");
  const availableQuery = query(driversRef, where("status", "==", "available"));
  const snapshot = await getDocs(availableQuery);
  const drivers = snapshot.docs.map((item) => item.data() as DriverData);

  return drivers
    .map((driver) => ({
      driver,
      distanceKm: calculateDistance(
        pickupLocation.lat,
        pickupLocation.lng,
        driver.currentLocation.lat,
        driver.currentLocation.lng,
      ),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}

export async function autoAssignDriver(orderId: string, pickupLocation: { lat: number; lng: number }) {
  const nearest = await findNearestDrivers(pickupLocation, 1);
  if (nearest.length === 0) return null;

  const winner = nearest[0].driver;
  await updateDoc(doc(db, "orders", orderId), {
    assignedDriverId: winner.driverId,
    assignedDriverName: winner.name,
    assignedDriverPhone: winner.phone,
    status: "accepted",
  });
  await updateDoc(doc(db, "drivers", winner.driverId), {
    status: "busy",
  });

  return winner;
}

export function enableDemoSafeMode() {
  demoSafeModeEnabled = true;
}

export function loadDriversMarkers(
  map: any,
  drivers: DriverData[],
  markerStore: Map<string, any>,
) {
  const visibleIds = new Set<string>();
  drivers
    .filter((driver) => driver.status === "available")
    .forEach((driver) => {
      visibleIds.add(driver.driverId);
      const position = {
        lat: driver.currentLocation.lat,
        lng: driver.currentLocation.lng,
      };
      const existing = markerStore.get(driver.driverId);
      if (existing) {
        existing.setLatLng(position);
        return;
      }
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker(position, { icon: customIcon }).addTo(map);
      marker.bindTooltip(driver.name, { direction: 'top', offset: [0, -10] });
      markerStore.set(driver.driverId, marker);
    });

  markerStore.forEach((marker, id) => {
    if (!visibleIds.has(id)) {
      map.removeLayer(marker);
      markerStore.delete(id);
    }
  });
}

export function listenDriversLive(
  onData: (drivers: DriverData[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  const driversRef = collection(db, "drivers");
  const availableQuery = query(driversRef, where("status", "==", "available"));

  return onSnapshot(
    availableQuery,
    (snapshot) => {
      const drivers = snapshot.docs.map((item) => item.data() as DriverData);
      onData(drivers);
    },
    (error) => {
      if (onError) onError(error);
    },
  );
}

export function drawRoute(
  map: any,
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  routeStore: {
    startMarker?: any;
    endMarker?: any;
    routingControl?: any;
  },
) {
  if (routeStore.startMarker) map.removeLayer(routeStore.startMarker);
  if (routeStore.endMarker) map.removeLayer(routeStore.endMarker);
  if (routeStore.routingControl) {
    map.removeControl(routeStore.routingControl);
  }

  routeStore.startMarker = L.marker(start).addTo(map);
  routeStore.endMarker = L.marker(end).addTo(map);

  const plan = new (L as any).Routing.Plan([
    L.latLng(start.lat, start.lng),
    L.latLng(end.lat, end.lng)
  ], {
    createMarker: function() { return null; }
  });

  routeStore.routingControl = (L as any).Routing.control({
    plan,
    lineOptions: {
      styles: [{ color: '#8b5cf6', opacity: 0.8, weight: 5 }]
    },
    show: false,
    addWaypoints: false,
    routeWhileDragging: false,
    fitSelectedRoutes: true
  }).addTo(map);
}

export function startDriverLocationUpdates(driverId: string, options?: { intervalMs?: number }) {
  if (demoSafeModeEnabled) return () => {};
  
  const intervalMs = options?.intervalMs ?? 5000;
  const interval = setInterval(() => {
    getUserLocation()
      .then((coords) => {
        const driverRef = doc(db, "drivers", driverId);
        updateDoc(driverRef, {
          currentLocation: coords,
          lastUpdatedAt: serverTimestamp(),
        }).catch(() => {});
      })
      .catch(() => {});
  }, intervalMs);

  return () => clearInterval(interval);
}

export function startDemoMovement(
  orderId: string,
  driverId: string,
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  durationMs = 30000,
) {
  return new Promise<void>((resolve) => {
    if (demoMovementStopFn) {
      demoMovementStopFn();
    }

    const steps = 60;
    const intervalMs = durationMs / steps;
    const latStep = (end.lat - start.lat) / steps;
    const lngStep = (end.lng - start.lng) / steps;

    let currentStep = 0;
    let currentLat = start.lat;
    let currentLng = start.lng;

    const interval = setInterval(() => {
      currentStep++;
      currentLat += latStep;
      currentLng += lngStep;

      const driverRef = doc(db, "drivers", driverId);
      updateDoc(driverRef, {
        currentLocation: { lat: currentLat, lng: currentLng },
        lastUpdatedAt: serverTimestamp(),
      }).catch(console.error);

      if (currentStep >= steps) {
        clearInterval(interval);
        demoMovementStopFn = null;
        resolve();
      }
    }, intervalMs);

    demoMovementStopFn = () => {
      clearInterval(interval);
      resolve();
    };
  });
}

export function stopDemoMovement() {
  if (demoMovementStopFn) {
    demoMovementStopFn();
    demoMovementStopFn = null;
  }
}

export function selectPickup(marker: any, map: any, location: { lat: number; lng: number }) {
  if (marker) {
    marker.setLatLng(location);
    if (!map.hasLayer(marker)) marker.addTo(map);
  }
}

export function selectDropoff(marker: any, map: any, location: { lat: number; lng: number }) {
  if (marker) {
    marker.setLatLng(location);
    if (!map.hasLayer(marker)) marker.addTo(map);
  }
}

export function createMarker(color: string, position?: { lat: number; lng: number }) {
  const customIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
  return L.marker(position ?? BAHRAIN_CENTER, { icon: customIcon });
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
    const data = await res.json();
    return data.display_name || 'Pinned location';
  } catch (e) {
    return 'Pinned location';
  }
}

export async function geocode(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=bh&limit=1`);
    const data = await res.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  } catch (e) {
    return null;
  }
}

export function listenDriverTracking(
  driverId: string,
  onLocationUpdate: (location: { lat: number; lng: number }) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const driverRef = doc(db, "drivers", driverId);
  return onSnapshot(
    driverRef,
    (snapshot) => {
      const data = snapshot.data();
      if (data && data.currentLocation) {
        onLocationUpdate({ lat: data.currentLocation.lat, lng: data.currentLocation.lng });
      }
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}

export function mockMovementForDemo(driverId: string, target: { lat: number; lng: number }) {
  // basic mock that slowly moves towards target
  let currentLat = BAHRAIN_CENTER.lat;
  let currentLng = BAHRAIN_CENTER.lng;
  const interval = setInterval(() => {
    currentLat += (target.lat - currentLat) * 0.1;
    currentLng += (target.lng - currentLng) * 0.1;
    updateDoc(doc(db, "drivers", driverId), {
      currentLocation: { lat: currentLat, lng: currentLng }
    }).catch(() => {});
  }, 2000);
  return () => clearInterval(interval);
}

export function animateMarker(marker: any, position: { lat: number; lng: number }) {
  if (marker) {
    marker.setLatLng(position);
  }
}

