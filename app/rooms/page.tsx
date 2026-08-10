"use client";

import { useMemo, useState } from "react";
import { ROOMS } from "@/lib/rooms";
import { RoomCard } from "@/components/room-card";
import { EquipmentFilter, roomMatchesFilters, type RoomFilters } from "@/components/equipment-filter";

export default function RoomsPage() {
  const [filters, setFilters] = useState<RoomFilters>({ equipment: [], minCapacity: null });

  const filteredRooms = useMemo(
    () => ROOMS.filter((room) => roomMatchesFilters(room, filters)),
    [filters]
  );

  return (
    <div className="flex flex-col gap-4 p-4 md:flex-row md:gap-6 md:p-6">
      <aside className="md:w-64 md:shrink-0">
        <EquipmentFilter filters={filters} onChange={setFilters} />
      </aside>
      <div className="flex-1">
        <h1 className="mb-3 text-lg font-semibold">会議室一覧</h1>
        {filteredRooms.length === 0 ? (
          <p className="text-sm text-muted-foreground">条件に合う会議室がありません。</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
