import { useEffect, useRef, useState } from 'react';
import { listenForAllDrivers, listenForAllOrders, listenForAllUsers } from '../../../services/firebaseService';
import { BAHRAIN_CENTER, initializeMap } from '../../../services/googleMapsService';

export function AdminRealtimeMap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const userMarkersRef = useRef<Map<string, any>>(new Map());
  const driverMarkersRef = useRef<Map<string, any>>(new Map());
  const orderMarkersRef = useRef<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let unUsers: (() => void) | null = null;
    let unDrivers: (() => void) | null = null;
    let unOrders: (() => void) | null = null;

    const init = async () => {
      if (!mapContainerRef.current) return;
      try {
        const map = await initializeMap(mapContainerRef.current, { center: BAHRAIN_CENTER, zoom: 11 });
        mapRef.current = map;

        unUsers = listenForAllUsers((users) => {
          const activeIds = new Set<string>();
          users.forEach((user, index) => {
            activeIds.add(user.uid);
            const markerPos = { lat: 26.04 + index * 0.002, lng: 50.53 + index * 0.002 };
            const existing = userMarkersRef.current.get(user.uid);
            if (existing) {
              existing.setPosition(markerPos);
              return;
            }
            const marker = new window.google.maps.Marker({
              map,
              position: markerPos,
              title: `User: ${user.name}`,
              icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            });
            userMarkersRef.current.set(user.uid, marker);
          });

          userMarkersRef.current.forEach((marker, id) => {
            if (!activeIds.has(id)) {
              marker.setMap(null);
              userMarkersRef.current.delete(id);
            }
          });
        });

        unDrivers = listenForAllDrivers((drivers) => {
          const activeIds = new Set<string>();
          drivers.forEach((driver) => {
            activeIds.add(driver.driverId);
            const existing = driverMarkersRef.current.get(driver.driverId);
            const markerPos = driver.currentLocation || BAHRAIN_CENTER;
            if (existing) {
              existing.setPosition(markerPos);
              return;
            }
            const marker = new window.google.maps.Marker({
              map,
              position: markerPos,
              title: `Driver: ${driver.name} (${driver.status})`,
              icon:
                driver.status === 'available'
                  ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                  : "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
            });
            driverMarkersRef.current.set(driver.driverId, marker);
          });

          driverMarkersRef.current.forEach((marker, id) => {
            if (!activeIds.has(id)) {
              marker.setMap(null);
              driverMarkersRef.current.delete(id);
            }
          });
        });

        unOrders = listenForAllOrders((orders) => {
          const activeOrders = orders.filter((order) => order.status === 'pending' || order.status === 'accepted');
          const activeIds = new Set<string>();
          activeOrders.forEach((order) => {
            activeIds.add(order.orderId);
            const existing = orderMarkersRef.current.get(order.orderId);
            const markerPos = order.pickupLocation || BAHRAIN_CENTER;
            if (existing) {
              existing.setPosition(markerPos);
              return;
            }
            const marker = new window.google.maps.Marker({
              map,
              position: markerPos,
              title: `Order: ${order.userName} (${order.status})`,
              icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
            });
            orderMarkersRef.current.set(order.orderId, marker);
          });

          orderMarkersRef.current.forEach((marker, id) => {
            if (!activeIds.has(id)) {
              marker.setMap(null);
              orderMarkersRef.current.delete(id);
            }
          });
        });
      } catch (e) {
        console.error(e);
        setError('Failed to load admin map');
      } finally {
        setLoading(false);
      }
    };

    void init();

    return () => {
      if (unUsers) unUsers();
      if (unDrivers) unDrivers();
      if (unOrders) unOrders();
      userMarkersRef.current.forEach((marker) => marker.setMap(null));
      driverMarkersRef.current.forEach((marker) => marker.setMap(null));
      orderMarkersRef.current.forEach((marker) => marker.setMap(null));
      userMarkersRef.current.clear();
      driverMarkersRef.current.clear();
      orderMarkersRef.current.clear();
    };
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-3">Bahrain Live Operations Map</h2>
      <div className="h-72 rounded-xl overflow-hidden border border-gray-200 relative">
        {loading && <div className="absolute inset-0 z-10 bg-white/80 flex items-center justify-center text-sm text-gray-600">Loading map...</div>}
        {error && <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-xs px-2 py-1 rounded">{error}</div>}
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
}
