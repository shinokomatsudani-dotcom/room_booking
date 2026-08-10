"use client";

import { useSyncExternalStore } from "react";
import * as reservationStore from "@/lib/reservation-store";
import type { ReservationInput } from "@/lib/types";

export function useReservations() {
  const reservations = useSyncExternalStore(
    reservationStore.subscribe,
    reservationStore.getSnapshot,
    reservationStore.getServerSnapshot
  );

  return {
    reservations,
    createReservation: (input: ReservationInput) =>
      reservationStore.createReservation(input),
    getReservationsForRoom: (roomId: string) =>
      reservations
        .filter((r) => r.roomId === roomId)
        .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()),
  };
}
