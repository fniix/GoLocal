import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  limit,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { auth } from "../firebase";

export type UserRole = "user" | "driver" | "admin";
export type DriverStatus = "available" | "busy" | "offline";
export type OrderStatus = "pending" | "accepted" | "rejected" | "completed" | "cancelled";

export interface OfferData {
  offerId: string;
  driverId: string;
  driverName: string;
  fromCity: string;
  fromArea: string;
  toCity: string;
  toArea: string;
  serviceType: string;
  priceType: string;
  basePrice: string;
  availableTime: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt?: unknown;
}

export interface UserData {
  uid: string;
  name: string;
  email: string;
  phone: string;
  city?: string;
  role: UserRole;
  status?: "active" | "banned" | "suspended";
  createdAt?: unknown;
}

export interface DriverData {
  driverId: string;
  name: string;
  phone: string;
  carType: string;
  status: DriverStatus;
  currentLocation: { lat: number; lng: number };
  rating?: number;
  totalTrips?: number;
  createdAt?: unknown;
  lastUpdatedAt?: unknown;
}

export interface OrderData {
  orderId: string;
  userId: string;
  userName: string;
  userPhone: string;
  pickupLocation: { lat: number; lng: number };
  dropoffLocation: { lat: number; lng: number };
  pickupAddress?: string;
  dropoffAddress?: string;
  assignedDriverId: string | null;
  assignedDriverName: string | null;
  assignedDriverPhone: string | null;
  status: OrderStatus;
  createdAt?: unknown;
}

type Unsubscribe = () => void;

const mapUser = (id: string, data: any): UserData => ({
  uid: id,
  name: data?.name ?? "",
  email: data?.email ?? "",
  phone: data?.phone ?? "",
  city: data?.city ?? "",
  role: String(data?.role ?? "user").toLowerCase() as UserRole,
  status: data?.status ?? "active",
  createdAt: data?.createdAt,
});

const mapDriver = (id: string, data: any): DriverData => ({
  driverId: data?.driverId ?? id,
  name: data?.name ?? "",
  phone: data?.phone ?? "",
  carType: data?.carType ?? data?.vehicleType ?? "",
  status: (data?.status ?? "offline") as DriverStatus,
  currentLocation: {
    lat: data?.currentLocation?.lat ?? 26.2235,
    lng: data?.currentLocation?.lng ?? 50.5876,
  },
  rating: data?.rating ?? 0,
  totalTrips: data?.totalTrips ?? 0,
  createdAt: data?.createdAt,
  lastUpdatedAt: data?.lastUpdatedAt,
});

const mapOrder = (id: string, data: any): OrderData => ({
  orderId: data?.orderId ?? id,
  userId: data?.userId ?? "",
  userName: data?.userName ?? "",
  userPhone: data?.userPhone ?? "",
  pickupLocation: {
    lat: data?.pickupLocation?.lat ?? 0,
    lng: data?.pickupLocation?.lng ?? 0,
  },
  dropoffLocation: {
    lat: data?.dropoffLocation?.lat ?? 0,
    lng: data?.dropoffLocation?.lng ?? 0,
  },
  pickupAddress: data?.pickupAddress ?? "",
  dropoffAddress: data?.dropoffAddress ?? "",
  assignedDriverId: data?.assignedDriverId ?? null,
  assignedDriverName: data?.assignedDriverName ?? null,
  assignedDriverPhone: data?.assignedDriverPhone ?? null,
  status: (data?.status ?? "pending") as OrderStatus,
  createdAt: data?.createdAt,
});

export async function createUserProfile(input: {
  uid: string;
  name: string;
  email: string;
  phone: string;
  city?: string;
  role: UserRole;
  extra?: Record<string, unknown>;
}) {
  const userRef = doc(db, "users", input.uid);
  await setDoc(userRef, {
    uid: input.uid,
    name: input.name,
    email: input.email,
    phone: input.phone,
    city: input.city ?? "",
    role: input.role,
    status: "active",
    createdAt: serverTimestamp(),
    ...(input.extra ?? {}),
  });
}

export async function createDriverProfile(input: {
  driverId: string;
  name: string;
  phone: string;
  carType: string;
  status?: DriverStatus;
  currentLocation?: { lat: number; lng: number };
}) {
  const driverRef = doc(db, "drivers", input.driverId);
  await setDoc(driverRef, {
    driverId: input.driverId,
    name: input.name,
    phone: input.phone,
    carType: input.carType,
    status: input.status ?? "offline",
    currentLocation: input.currentLocation ?? { lat: 26.2235, lng: 50.5876 },
    rating: 0,
    totalTrips: 0,
    createdAt: serverTimestamp(),
  });
}

export async function fetchUserProfile(uid: string): Promise<UserData | null> {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;
  return mapUser(snap.id, snap.data());
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<Pick<UserData, "name" | "phone" | "email" | "city">>,
) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, updates);
}

export async function updateUserByAdmin(
  uid: string,
  updates: Partial<Pick<UserData, "name" | "phone" | "role">>,
) {
  await updateDoc(doc(db, "users", uid), updates);
}

export function listenToUserProfile(
  uid: string,
  onData: (user: UserData | null) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  const userRef = doc(db, "users", uid);
  return onSnapshot(
    userRef,
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      onData(mapUser(snap.id, snap.data()));
    },
    onError,
  );
}

export async function fetchDrivers(): Promise<DriverData[]> {
  const snapshot = await getDocs(collection(db, "drivers"));
  return snapshot.docs.map((item) => mapDriver(item.id, item.data()));
}

export function listenToDrivers(
  onData: (drivers: DriverData[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  const driversQuery = query(collection(db, "drivers"), orderBy("createdAt", "desc"));
  return onSnapshot(
    driversQuery,
    (snapshot) => {
      const drivers = snapshot.docs.map((item) => mapDriver(item.id, item.data()));
      onData(drivers);
    },
    onError,
  );
}

export async function updateDriverStatus(driverId: string, status: DriverStatus) {
  await updateDoc(doc(db, "drivers", driverId), { status });
}

export async function deleteDriver(driverId: string) {
  await deleteDoc(doc(db, "drivers", driverId));
}

export async function updateDriverByAdmin(
  driverId: string,
  updates: Partial<Pick<DriverData, "name" | "phone" | "carType" | "status" | "currentLocation">>,
) {
  await updateDoc(doc(db, "drivers", driverId), updates);
}

export async function createOrder(input: {
  pickupLocation: { lat: number; lng: number };
  dropoffLocation: { lat: number; lng: number };
  pickupAddress: string;
  dropoffAddress: string;
}) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("User not authenticated");
  }

  const userProfile = await fetchUserProfile(currentUser.uid);
  if (!userProfile) {
    throw new Error("User profile not found in Firestore");
  }

  const orderRef = await addDoc(collection(db, "orders"), {
    userId: currentUser.uid,
    userName: userProfile.name,
    userPhone: userProfile.phone,
    pickupLocation: input.pickupLocation,
    dropoffLocation: input.dropoffLocation,
    pickupAddress: input.pickupAddress,
    dropoffAddress: input.dropoffAddress,
    status: "pending",
    assignedDriverId: null,
    assignedDriverName: null,
    assignedDriverPhone: null,
    createdAt: serverTimestamp(),
  });
  await updateDoc(orderRef, { orderId: orderRef.id });
  return orderRef.id;
}

export async function createOffer(input: Omit<OfferData, 'offerId' | 'driverId' | 'driverName' | 'status' | 'createdAt'>) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Driver not authenticated");

  const driverProfile = await fetchUserProfile(currentUser.uid);
  const driverName = driverProfile ? driverProfile.name : "Unknown Driver";

  const offerRef = await addDoc(collection(db, "offers"), {
    ...input,
    driverId: currentUser.uid,
    driverName,
    status: 'active',
    createdAt: serverTimestamp(),
  });
  await updateDoc(offerRef, { offerId: offerRef.id });
  return offerRef.id;
}

export function listenDriverOffers(
  driverId: string,
  onData: (offers: OfferData[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  const offersQuery = query(
    collection(db, "offers"),
    where("driverId", "==", driverId)
  );
  return onSnapshot(
    offersQuery,
    (snapshot) => {
      const data = snapshot.docs.map((item) => ({ offerId: item.id, ...item.data() } as OfferData));
      data.sort((a, b) => {
         const timeA = (a.createdAt as any)?.toMillis?.() || 0;
         const timeB = (b.createdAt as any)?.toMillis?.() || 0;
         return timeB - timeA;
      });
      onData(data);
    },
    onError,
  );
}

export async function updateOrder(
  orderId: string,
  updates: Partial<Pick<OrderData, "status" | "assignedDriverId" | "assignedDriverName" | "assignedDriverPhone">>,
) {
  await updateDoc(doc(db, "orders", orderId), updates);
}

export async function updateOrderByAdmin(
  orderId: string,
  updates: Partial<Pick<OrderData, "status" | "assignedDriverId" | "assignedDriverName" | "assignedDriverPhone">>,
) {
  await updateDoc(doc(db, "orders", orderId), updates);
}

export async function acceptOrder(orderId: string) {
  const driverUid = auth.currentUser?.uid;
  if (!driverUid) {
    throw new Error("Driver is not authenticated");
  }

  const orderSnap = await getDoc(doc(db, "orders", orderId));
  if (!orderSnap.exists()) {
    throw new Error("Order not found");
  }
  const orderData = orderSnap.data();
  if (orderData?.assignedDriverId && orderData.assignedDriverId !== driverUid) {
    throw new Error("This order is assigned to another driver");
  }

  const driverDoc = await getDoc(doc(db, "drivers", driverUid));
  const driverData = driverDoc.exists() ? driverDoc.data() : null;

  await updateDoc(doc(db, "orders", orderId), {
    status: "accepted",
    assignedDriverId: driverUid,
    assignedDriverName: driverData?.name ?? null,
    assignedDriverPhone: driverData?.phone ?? null,
  });
  await updateDoc(doc(db, "drivers", driverUid), {
    status: "busy",
    lastUpdatedAt: serverTimestamp(),
  });
}

export async function setPreferredDriverForOrder(
  orderId: string,
  driver: Pick<DriverData, "driverId" | "name" | "phone">,
) {
  await updateDoc(doc(db, "orders", orderId), {
    assignedDriverId: driver.driverId,
    assignedDriverName: driver.name,
    assignedDriverPhone: driver.phone,
    updatedAt: serverTimestamp(),
  });
}

export async function rejectOrder(orderId: string) {
  await updateDoc(doc(db, "orders", orderId), {
    status: "rejected",
  });
}

export async function cancelOrder(orderId: string) {
  await updateDoc(doc(db, "orders", orderId), {
    status: "cancelled",
  });
}

export async function deleteOrder(orderId: string) {
  await deleteDoc(doc(db, "orders", orderId));
}

export function listenForUserOrders(
  userId: string,
  onData: (orders: OrderData[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  const ordersQuery = query(
    collection(db, "orders"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(20),
  );
  return onSnapshot(
    ordersQuery,
    (snapshot) => {
      onData(snapshot.docs.map((item) => mapOrder(item.id, item.data())));
    },
    onError,
  );
}

export function listenUserOrders(
  userId: string,
  onData: (orders: OrderData[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  return listenForUserOrders(userId, onData, onError);
}

export function listenForPendingOrders(
  onData: (orders: OrderData[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  const ordersQuery = query(
    collection(db, "orders"),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc"),
    limit(50),
  );
  return onSnapshot(
    ordersQuery,
    (snapshot) => {
      onData(snapshot.docs.map((item) => mapOrder(item.id, item.data())));
    },
    onError,
  );
}

export function listenPendingOrdersForDrivers(
  onData: (orders: OrderData[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  return listenForPendingOrders(onData, onError);
}

export function listenForDriverOrders(
  driverId: string,
  onData: (orders: OrderData[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  const ordersQuery = query(
    collection(db, "orders"),
    where("assignedDriverId", "==", driverId),
    orderBy("createdAt", "desc"),
    limit(20),
  );
  return onSnapshot(
    ordersQuery,
    (snapshot) => {
      onData(snapshot.docs.map((item) => mapOrder(item.id, item.data())));
    },
    onError,
  );
}

export function listenDriverAssignedOrders(
  driverId: string,
  onData: (orders: OrderData[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  return listenForDriverOrders(driverId, onData, onError);
}

export function listenForAllUsers(
  onData: (users: UserData[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"));
  return onSnapshot(
    usersQuery,
    (snapshot) => {
      onData(snapshot.docs.map((item) => mapUser(item.id, item.data())));
    },
    onError,
  );
}

export function listenForAllDrivers(
  onData: (drivers: DriverData[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  const driversQuery = query(collection(db, "drivers"), orderBy("createdAt", "desc"));
  return onSnapshot(
    driversQuery,
    (snapshot) => {
      onData(snapshot.docs.map((item) => mapDriver(item.id, item.data())));
    },
    onError,
  );
}

export function listenForAllOrders(
  onData: (orders: OrderData[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  return onSnapshot(
    ordersQuery,
    (snapshot) => {
      onData(snapshot.docs.map((item) => mapOrder(item.id, item.data())));
    },
    onError,
  );
}

export function listenOrderById(
  orderId: string,
  onData: (order: OrderData | null) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  const orderRef = doc(db, "orders", orderId);
  return onSnapshot(
    orderRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(null);
        return;
      }
      onData(mapOrder(snapshot.id, snapshot.data()));
    },
    onError,
  );
}

export async function setUserStatus(uid: string, status: "active" | "banned" | "suspended") {
  await updateDoc(doc(db, "users", uid), { status });
}

export async function deleteUser(uid: string) {
  await deleteDoc(doc(db, "users", uid));
}

// Backward-compatible wrappers used in existing screens.
export async function getAllDrivers(): Promise<(DriverData & { uid: string; vehicleType: string; vehiclePlate: string })[]> {
  const drivers = await fetchDrivers();
  return drivers.map((driver) => ({
    ...driver,
    uid: driver.driverId,
    vehicleType: driver.carType,
    vehiclePlate: "",
  }));
}

export async function getUserById(uid: string): Promise<UserData | null> {
  return fetchUserProfile(uid);
}

export async function getAllUsers(): Promise<UserData[]> {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map((item) => mapUser(item.id, item.data()));
}

export async function getDriversByCity(_city: string) {
  return fetchDrivers();
}
