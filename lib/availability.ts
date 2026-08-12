import type { Reservation, Room } from "@/lib/types";
import { formatTime } from "@/lib/format";

export type RoomNowStatus =
  | { available: true; untilLabel: string | null }
  | { available: false; untilLabel: string };

export function getRoomNowStatus(
  room: Room,
  roomReservations: Reservation[],
  now: Date
): RoomNowStatus {
  const nowMs = now.getTime();

  const current = roomReservations.find((r) => {
    const start = new Date(r.startAt).getTime();
    const end = new Date(r.endAt).getTime();
    return start <= nowMs && nowMs < end;
  });
  if (current) {
    return { available: false, untilLabel: formatTime(current.endAt) };
  }

  const closeToday = new Date(now);
  closeToday.setHours(room.closeHour, 0, 0, 0);

  const next = roomReservations
    .filter((r) => new Date(r.startAt).getTime() > nowMs)
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())[0];

  if (next && new Date(next.startAt).getTime() < closeToday.getTime()) {
    return { available: true, untilLabel: formatTime(next.startAt) };
  }
  if (nowMs >= closeToday.getTime()) {
    return { available: false, untilLabel: "本日の利用時間終了" };
  }
  return { available: true, untilLabel: formatTime(closeToday.toISOString()) };
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export type TimeSlot = { hour: number; minute: number; label: string };

export function generateTimeSlots(
  openHour: number,
  closeHour: number,
  stepMinutes: number
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  for (let h = openHour; h < closeHour; h++) {
    for (let m = 0; m < 60; m += stepMinutes) {
      slots.push({ hour: h, minute: m, label: `${h}:${String(m).padStart(2, "0")}` });
    }
  }
  return slots;
}

export function isSlotBusy(
  slotStart: Date,
  slotEnd: Date,
  roomReservations: Reservation[]
): Reservation | undefined {
  return roomReservations.find((r) => {
    const rStart = new Date(r.startAt).getTime();
    const rEnd = new Date(r.endAt).getTime();
    return slotStart.getTime() < rEnd && slotEnd.getTime() > rStart;
  });
}
