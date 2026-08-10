const STORAGE_KEY = "room-booking:user-name";

type Listener = () => void;

let userName: string | null = null;
let hydrated = false;
const listeners = new Set<Listener>();

function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  userName = window.localStorage.getItem(STORAGE_KEY);
}

export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): string | null {
  ensureHydrated();
  return userName;
}

export function getServerSnapshot(): string | null {
  return userName;
}

export function setUserName(name: string) {
  ensureHydrated();
  userName = name.trim();
  window.localStorage.setItem(STORAGE_KEY, userName);
  listeners.forEach((listener) => listener());
}
