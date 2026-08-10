"use client";

import { useSyncExternalStore } from "react";
import * as userStore from "@/lib/user-store";

export function useCurrentUser() {
  const name = useSyncExternalStore(
    userStore.subscribe,
    userStore.getSnapshot,
    userStore.getServerSnapshot
  );

  return { name, setName: userStore.setUserName };
}
