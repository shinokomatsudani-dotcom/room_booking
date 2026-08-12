"use client";

import { useState } from "react";
import type { Room } from "@/lib/types";
import { useReservations } from "@/hooks/use-reservations";
import { useCurrentUser } from "@/hooks/use-current-user";
import { generateTimeSlots, isSameDay, isSlotBusy } from "@/lib/availability";
import { ReservationDialog } from "@/components/reservation-dialog";

const STEP_MINUTES = 30;
const SLOT_WIDTH = 56;
const LABEL_WIDTH = 144; // matches the room-label column's w-36

export function Timeline({ date, rooms }: { date: Date; rooms: Room[] }) {
  const { getReservationsForRoom } = useReservations();
  const { name } = useCurrentUser();
  const [selected, setSelected] = useState<{ room: Room; start: Date } | null>(null);
  // Positioned via JS (not CSS group-hover) because a group-hover tooltip
  // placed inside the horizontally-scrolling grid gets clipped: setting
  // overflow-x forces the browser to also clip overflow-y, so anything
  // poking above/below a cell near the grid's edge never becomes visible.
  const [pastTooltip, setPastTooltip] = useState<{ left: number; top: number } | null>(null);

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
      <div className="flex items-center gap-4 border-b px-3 py-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-sm bg-primary" />
          自分の予約
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-sm bg-busy" />
          他の人の予約
        </span>
      </div>
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
                    const isMine = busy.organizer === name;
                    return (
                      <div
                        key={i}
                        style={{ width: SLOT_WIDTH }}
                        className={`shrink-0 border-l px-1 py-2 text-[11px] ${
                          isMine
                            ? "bg-primary text-primary-foreground"
                            : "bg-busy text-busy-foreground"
                        }`}
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
                        onMouseEnter={(e) => {
                          const r = e.currentTarget.getBoundingClientRect();
                          setPastTooltip({ left: r.left + r.width / 2, top: r.bottom + 4 });
                        }}
                        onMouseLeave={() => setPastTooltip(null)}
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

      {pastTooltip && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 rounded bg-foreground px-2 py-1 text-[11px] whitespace-nowrap text-background"
          style={{ left: pastTooltip.left, top: pastTooltip.top }}
        >
          過去の時間には予約できません
        </div>
      )}

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
