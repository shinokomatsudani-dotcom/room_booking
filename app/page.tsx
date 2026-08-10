"use client";

import { useMemo, useState } from "react";
import { ROOMS } from "@/lib/rooms";
import { useReservations } from "@/hooks/use-reservations";
import { getRoomNowStatus } from "@/lib/availability";
import { RoomCard } from "@/components/room-card";
import { Timeline } from "@/components/timeline";
import { EquipmentFilter, roomMatchesFilters, type RoomFilters } from "@/components/equipment-filter";
import { toDateInputValue } from "@/lib/format";

export default function Home() {
  const { getReservationsForRoom } = useReservations();
  const [filters, setFilters] = useState<RoomFilters>({ equipment: [], minCapacity: null });
  const [dateValue, setDateValue] = useState(toDateInputValue(new Date()));

  const now = new Date();
  const availableNowRooms = ROOMS.filter(
    (room) => getRoomNowStatus(room, getReservationsForRoom(room.id), now).available
  );

  const filteredRooms = useMemo(
    () => ROOMS.filter((room) => roomMatchesFilters(room, filters)),
    [filters]
  );

  return (
    <>
      {/* スマホ: 今すぐ使える会議室だけをシンプルに表示 */}
      <div className="flex flex-col gap-3 p-4 md:hidden">
        <h1 className="text-lg font-semibold">今すぐ使える会議室</h1>
        {availableNowRooms.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            現在空いている会議室はありません。
          </p>
        ) : (
          availableNowRooms.map((room) => <RoomCard key={room.id} room={room} compact />)
        )}
      </div>

      {/* Web: 複数会議室のタイムラインを見比べる */}
      <div className="hidden h-full md:flex">
        <aside className="w-64 shrink-0 border-r p-4">
          <div className="mb-4 flex flex-col gap-1.5">
            <label htmlFor="timeline-date" className="text-xs text-muted-foreground">
              日付
            </label>
            <input
              id="timeline-date"
              type="date"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              className="rounded-lg border border-input px-2.5 py-1.5 text-sm"
            />
          </div>
          <EquipmentFilter filters={filters} onChange={setFilters} />
        </aside>
        <div className="flex-1 overflow-hidden">
          <Timeline date={new Date(`${dateValue}T00:00:00`)} rooms={filteredRooms} />
        </div>
      </div>
    </>
  );
}
