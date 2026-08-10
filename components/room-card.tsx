"use client";

import { useState } from "react";
import type { Room } from "@/lib/types";
import { useReservations } from "@/hooks/use-reservations";
import { getRoomNowStatus } from "@/lib/availability";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReservationDialog } from "@/components/reservation-dialog";

export function RoomCard({
  room,
  compact = false,
}: {
  room: Room;
  compact?: boolean;
}) {
  const { getReservationsForRoom } = useReservations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const status = getRoomNowStatus(room, getReservationsForRoom(room.id), new Date());

  return (
    <>
      <Card size="sm">
        <CardHeader>
          <CardTitle>{room.name}</CardTitle>
          <CardDescription>{room.location}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Badge variant={status.available ? "outline" : "secondary"} className="w-fit">
            {status.available
              ? status.untilLabel
                ? `${status.untilLabel}まで空き`
                : "空いています"
              : `使用中（${status.untilLabel}まで）`}
          </Badge>

          {!compact && (
            <>
              <p className="text-xs text-muted-foreground">定員 {room.capacity}名</p>
              <div className="flex flex-wrap gap-1">
                {room.equipment.map((item) => (
                  <Badge key={item} variant="secondary">
                    {item}
                  </Badge>
                ))}
              </div>
              <Button
                size="sm"
                className="mt-1 w-fit"
                disabled={!status.available}
                onClick={() => setDialogOpen(true)}
              >
                予約する
              </Button>
            </>
          )}
        </CardContent>
      </Card>
      {dialogOpen && (
        <ReservationDialog room={room} onClose={() => setDialogOpen(false)} />
      )}
    </>
  );
}
