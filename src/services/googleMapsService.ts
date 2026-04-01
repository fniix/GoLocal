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

export const BAHRAIN_CENTER = { lat: 26.0667, lng: 50.5577 };
export const BAHRAIN_BOUNDS = {
  north: 26.35,
  south: 25.95,
  west: 50.35,
  east: 50.85,
};
const DEFAULT_ZOOM = 11;

declare global {
  interface Window {
    google?: any;
  }
}

let mapsLoaderPromise: Promise<void> | null = null;
let demoSafeModeEnabled = false;
let demoMovementStopFn: (() => void) | null = null;

export function loadGoogleMapsScript() {
  if (window.google?.maps) return Promise.resolve();
  if (mapsLoaderPromise) return mapsLoaderPromise;

  mapsLoaderPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById("google-maps-script");
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Maps")), { once: true });
      return;
    }

    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!key) {
      reject(new Error("Missing VITE_GOOGLE_MAPS_API_KEY"));
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });

  return mapsLoaderPromise;
}

export async function initializeMap(
  container: HTMLDivElement,
  options?: { center?: { lat: number; lng: number }; zoom?: number },
) {
  await loadGoogleMapsScript();
  return new window.google.maps.Map(container, {
    center: options?.center ?? BAHRAIN_CENTER,
    zoom: options?.zoom ?? DEFAULT_ZOOM,
    restriction: {
      latLngBounds: BAHRAIN_BOUNDS,
      strictBounds: false,
    },
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  });
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
        existing.setPosition(position);
        return;
      }
      const marker = new window.google.maps.Marker({
        map,
        position,
        title: driver.name,
      });
      markerStore.set(driver.driverId, marker);
    });

  markerStore.forEach((marker, id) => {
    if (!visibleIds.has(id)) {
      marker.setMap(null);
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
    onError,
  );
}

export function selectPickup(marker: any, map: any, location: { lat: number; lng: number }) {
  marker.setPosition(location);
  marker.setMap(map);
}

export function selectDropoff(marker: any, map: any, location: { lat: number; lng: number }) {
  marker.setPosition(location);
  marker.setMap(map);
}

export function drawRoute(
  map: any,
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  renderer?: any,
) {
  const directionsService = new window.google.maps.DirectionsService();
  const directionsRenderer = renderer ?? new window.google.maps.DirectionsRenderer({ suppressMarkers: true });
  directionsRenderer.setMap(map);

  return new Promise<any>((resolve, reject) => {
    directionsService.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result: any, status: string) => {
        if (status !== "OK") {
          reject(new Error(`Directions failed: ${status}`));
          return;
        }
        directionsRenderer.setDirections(result);
        resolve(result);
      },
    );
  });
}

export async function getRoutePoints(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
) {
  await loadGoogleMapsScript();
  const directionsService = new window.google.maps.DirectionsService();
  return new Promise<Array<{ lat: number; lng: number }>>((resolve, reject) => {
    directionsService.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result: any, status: string) => {
        if (status !== "OK") {
          reject(new Error(`Directions failed: ${status}`));
          return;
        }
        const route = result?.routes?.[0];
        if (!route?.overview_path) {
          reject(new Error("No route points available"));
          return;
        }
        resolve(route.overview_path.map((point: any) => ({ lat: point.lat(), lng: point.lng() })));
      },
    );
  });
}

export function listenDriverTracking(
  driverId: string,
  onLocation: (location: { lat: number; lng: number }) => void,
  onError?: (error: unknown) => void,
) {
  return onSnapshot(
    doc(db, "drivers", driverId),
    (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.data() as DriverData;
      onLocation(data.currentLocation);
    },
    onError,
  );
}

export function animateMarker(marker: any, target: { lat: number; lng: number }, duration = 1000) {
  const start = marker.getPosition();
  if (!start) {
    marker.setPosition(target);
    return;
  }
  const from = { lat: start.lat(), lng: start.lng() };
  const startedAt = performance.now();

  const tick = (now: number) => {
    const t = Math.min((now - startedAt) / duration, 1);
    marker.setPosition({
      lat: from.lat + (target.lat - from.lat) * t,
      lng: from.lng + (target.lng - from.lng) * t,
    });
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function simulateDriverMovement(routePoints: Array<{ lat: number; lng: number }>) {
  let currentIndex = 0;
  return () => {
    if (routePoints.length === 0) return BAHRAIN_CENTER;
    const point = routePoints[currentIndex];
    currentIndex = (currentIndex + 1) % routePoints.length;
    return point;
  };
}

export async function startDemoMovement(
  orderId: string,
  driverId: string,
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
) {
  try {
    const routePoints = await getRoutePoints(origin, destination);
    const nextPoint = simulateDriverMovement(routePoints);
    let lastPersisted = Date.now();
    const timer = window.setInterval(async () => {
      const point = nextPoint();
      try {
        if (Date.now() - lastPersisted >= 5000) {
          await updateDoc(doc(db, "drivers", driverId), {
            currentLocation: point,
            lastUpdatedAt: serverTimestamp(),
          });
          lastPersisted = Date.now();
        }
      } catch (error) {
        console.error("Demo movement firestore update failed:", error);
      }
    }, 1000);
    demoMovementStopFn = () => window.clearInterval(timer);
    return demoMovementStopFn;
  } catch (error) {
    console.error("startDemoMovement failed:", error);
    return null;
  }
}

export function stopDemoMovement() {
  if (demoMovementStopFn) {
    demoMovementStopFn();
    demoMovementStopFn = null;
  }
}

export async function mockMovementForDemo(
  driverId: string,
  target: { lat: number; lng: number } = BAHRAIN_CENTER,
) {
  const stop = await startDemoMovement("demo-order", driverId, BAHRAIN_CENTER, target);
  return () => {
    if (stop) stop();
  };
}

export function startDriverLocationUpdates(
  driverId: string,
  options?: {
    intervalMs?: number;
    demoTarget?: { lat: number; lng: number };
    activeOrderId?: string;
    origin?: { lat: number; lng: number };
    destination?: { lat: number; lng: number };
  },
) {
  const intervalMs = options?.intervalMs ?? 5000;
  let stopMock: (() => void) | null = null;

  const timer = window.setInterval(async () => {
    try {
      const loc = await getUserLocation();
      await updateDoc(doc(db, "drivers", driverId), {
        currentLocation: loc,
        lastUpdatedAt: serverTimestamp(),
      });
    } catch (error) {
      if (demoSafeModeEnabled || !stopMock) {
        if (options?.activeOrderId && options?.origin && options?.destination) {
          const stop = await startDemoMovement(
            options.activeOrderId,
            driverId,
            options.origin,
            options.destination,
          );
          if (stop) stopMock = stop;
        } else {
          const stop = await mockMovementForDemo(driverId, options?.demoTarget ?? BAHRAIN_CENTER);
          stopMock = stop;
        }
      }
    }
  }, intervalMs);

  return () => {
    window.clearInterval(timer);
    if (stopMock) stopMock();
  };
}
