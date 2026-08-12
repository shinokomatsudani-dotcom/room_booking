"use client";

import { useState } from "react";
import type { Room } from "@/lib/types";
import { useReservations } from "@/hooks/use-reservations";
import { generateTimeSlots, isSameDay, isSlotBusy } from "@/lib/availability";
import { ReservationDialog } from "@/components/reservation-dialog";

const STEP_MINUTES = 30;
const SLOT_WIDTH = 56;
const LABEL_WIDTH = 144; // matches the room-label column's w-36

export function Timeline({ date, rooms }: { date: Date; rooms: Room[] }) {
  const { getReservationsForRoom } = useReservations();
  const [selected, setSelected] = useState<{ room: Room; start: Date } | null>(null);

  const openHour = Math.min(...rooms.map((r) => r.openHour), 9);
  const closeHour = Math.max(...rooms.map((r) => r.closeHour), 19);
  const slots = generateTimeSlots(openHour, closeHour, STEP_MINUTES);

  const now = new Date();
  const nowMinutesFromOpen = (now.getHours() - openHour) * 60 + now.getMinutes();
  const showNowLine = isSameDay(date, now) && nowMinutesFromOpen >= 0 && nowMinutesFromOpen <= (closeHour - openHour) * 60;
  const nowLineLeft = LABEL_WIDTH + (nowMinutesFromOpen / STEP_MINUTES) * SLOT_WIDTH;

  function slotDate(hour: number, minute: number) {
    const d = new Date(date);
    d.setHours(hour, minute, 0, 0);
    return d;
  }

  if (rooms.length === 0) {
    return (
      <p className="p-6 text-sm text-muted-foreground">
        条件に合う会議室がありません。フィルターを見直してください。
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <div className="relative inline-block min-w-full">
          {showNowLine && (
            <div
              className="pointer-events-none absolute top-0 z-20 h-full w-px bg-red-500"
              style={{ left: nowLineLeft }}
            >
              <span className="absolute -top-4 -translate-x-1/2 rounded bg-red-500 px-1 text-[10px] whitespace-nowrap text-white">
                現在
              </span>
            </div>
          )}
          <div className="flex border-b">
            <div className="sticky left-0 z-10 w-36 shrink-0 bg-background" />
            {slots.map((slot, i) => (
              <div
                key={i}
                style={{ width: SLOT_WIDTH }}
                className="shrink-0 border-l py-1 text-center text-[11px] text-muted-foreground"
              >
                {slot.minute === 0 ? slot.label : ""}
              </div>
            ))}
          </div>

          {rooms.map((room) => {
            const roomReservations = getReservationsForRoom(room.id);
            return (
              <div key={room.id} className="flex border-b">
                <div className="sticky left-0 z-10 w-36 shrink-0 bg-background py-2 pr-2">
                  <p className="text-sm font-medium">{room.name}</p>
                  <p className="text-xs text-muted-foreground">{room.location}</p>
                </div>
                {slots.map((slot, i) => {
                  const start = slotDate(slot.hour, slot.minute);
                  const end = new Date(start.getTime() + STEP_MINUTES * 60000);
                  const busy = isSlotBusy(start, end, roomReservations);
                  const isLabelSlot = busy && new Date(busy.startAt).getTime() === start.getTime();
                  const isPast = end.getTime() <= Date.now();

                  if (busy) {
                    return (
                      <div
                        key={i}
                        style={{ width: SLOT_WIDTH }}
                        className="shrink-0 border-l bg-busy px-1 py-2 text-[11px] text-busy-foreground"
                        title={busy.title}
                      >
                        {isLabelSlot ? <span className="line-clamp-2">{busy.title}</span> : null}
                      </div>
                    );
                  }

                  if (isPast) {
                    return (
                      <div
                        key={i}
                        style={{ width: SLOT_WIDTH }}
                        className="shrink-0 border-l bg-muted/40 py-2"
                        title="過去の時間には予約できません"
                      />
                    );
                  }

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelected({ room, start })}
                      style={{ width: SLOT_WIDTH }}
                      className="shrink-0 border-l py-2 transition-colors hover:bg-accent"
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {selected && (
        <ReservationDialog
          room={selected.room}
          onClose={() => setSelected(null)}
          initialStart={selected.start}
        />
      )}
    </>
  );
}
