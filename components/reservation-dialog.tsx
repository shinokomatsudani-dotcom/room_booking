"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Room } from "@/lib/types";
import { useReservations } from "@/hooks/use-reservations";
import { useCurrentUser } from "@/hooks/use-current-user";
import { combineDateAndTime, formatDateLabel, toDateInputValue, toTimeInputValue } from "@/lib/format";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

/**
 * Mounted only while the booking dialog should be visible (parent renders it
 * conditionally). This lets useState initializers seed each field from
 * `initialStart`/`initialEnd` exactly once per open, with no reset effect.
 */
export function ReservationDialog({
  room,
  onClose,
  initialStart,
  initialEnd,
}: {
  room: Room;
  onClose: () => void;
  initialStart?: Date;
  initialEnd?: Date;
}) {
  const { createReservation } = useReservations();
  const { name } = useCurrentUser();

  const [step, setStep] = useState<"form" | "confirm">("form");
  const [date, setDate] = useState(() => toDateInputValue(initialStart ?? new Date()));
  const [startTime, setStartTime] = useState(() =>
    toTimeInputValue(initialStart ?? new Date())
  );
  const [endTime, setEndTime] = useState(() =>
    toTimeInputValue(initialEnd ?? new Date((initialStart ?? new Date()).getTime() + 60 * 60000))
  );
  const [title, setTitle] = useState("");
  const [attendeeCount, setAttendeeCount] = useState(1);
  const [error, setError] = useState<string | null>(null);

  function handleNext() {
    if (!title.trim()) {
      setError("会議名を入力してください。");
      return;
    }
    if (startTime >= endTime) {
      setError("終了時間は開始時間より後にしてください。");
      return;
    }
    if (attendeeCount > room.capacity) {
      setError(`定員${room.capacity}名の会議室に${attendeeCount}名は予約できません。`);
      return;
    }
    setError(null);
    setStep("confirm");
  }

  function handleConfirm() {
    if (!name) return;
    const result = createReservation({
      roomId: room.id,
      title: title.trim(),
      startAt: combineDateAndTime(date, startTime),
      endAt: combineDateAndTime(date, endTime),
      organizer: name,
      attendeeCount,
    });
    if (!result.ok) {
      setError(result.error);
      setStep("form");
      return;
    }
    toast.success("予約が確定しました");
    onClose();
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{room.name}を予約</DialogTitle>
          <DialogDescription>
            {room.location} ・ 定員{room.capacity}名
          </DialogDescription>
        </DialogHeader>

        {step === "form" ? (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-3 flex flex-col gap-1.5">
                <Label htmlFor="res-date" className="text-xs text-muted-foreground">
                  日付
                </Label>
                <Input
                  id="res-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  本日: {formatDateLabel(new Date().toISOString())}
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="res-start" className="text-xs text-muted-foreground">
                  開始
                </Label>
                <Input
                  id="res-start"
                  type="time"
                  step={1800}
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="res-end" className="text-xs text-muted-foreground">
                  終了
                </Label>
                <Input
                  id="res-end"
                  type="time"
                  step={1800}
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="res-title" className="text-xs text-muted-foreground">
                会議名
              </Label>
              <Input
                id="res-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例: 週次進捗確認"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="res-attendees" className="text-xs text-muted-foreground">
                参加人数
              </Label>
              <Input
                id="res-attendees"
                type="number"
                min={1}
                max={room.capacity}
                value={attendeeCount}
                onChange={(e) => setAttendeeCount(Number(e.target.value))}
                className="w-24"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        ) : (
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">会議室</span>
              <span>{room.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">日時</span>
              <span>
                {date} {startTime}〜{endTime}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">会議名</span>
              <span>{title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">予約者</span>
              <span>{name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">参加人数</span>
              <span>{attendeeCount}名</span>
            </div>
            {error && <p className="text-destructive">{error}</p>}
          </div>
        )}

        <DialogFooter>
          {step === "form" ? (
            <Button onClick={handleNext}>確認する</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep("form")}>
                戻る
              </Button>
              <Button onClick={handleConfirm}>予約を確定する</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
