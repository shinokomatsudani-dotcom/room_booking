"use client";

import { useMemo } from "react";
import { useReservations } from "@/hooks/use-reservations";
import { useCurrentUser } from "@/hooks/use-current-user";
import { getRoomById } from "@/lib/rooms";
import { dateKey, formatDateLabel, formatTime } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function MyReservationsPage() {
  const { reservations } = useReservations();
  const { name } = useCurrentUser();

  const groups = useMemo(() => {
    const mine = reservations
      .filter((r) => r.organizer === name)
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

    const map = new Map<string, typeof mine>();
    for (const r of mine) {
      const key = dateKey(r.startAt);
      map.set(key, [...(map.get(key) ?? []), r]);
    }
    return [...map.entries()];
  }, [reservations, name]);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <h1 className="text-lg font-semibold">自分の予約</h1>
      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">まだ予約がありません。</p>
      ) : (
        groups.map(([key, items]) => (
          <div key={key} className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-muted-foreground">
              {formatDateLabel(items[0].startAt)}
            </h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((r) => {
                const room = getRoomById(r.roomId);
                return (
                  <Card key={r.id} size="sm">
                    <CardHeader>
                      <CardTitle>{r.title}</CardTitle>
                      <CardDescription>
                        {room?.name} ・ {room?.location}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      {formatTime(r.startAt)}〜{formatTime(r.endAt)} ・ {r.attendeeCount}名
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
