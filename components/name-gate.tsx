"use client";

import { useState } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NameGate() {
  const { name, setName } = useCurrentUser();
  const [draft, setDraft] = useState("");

  if (name !== null) return null;

  return (
    <Dialog open>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>あなたの名前を入力してください</DialogTitle>
          <DialogDescription>
            予約者として使われます。次回以降は入力不要です。
          </DialogDescription>
        </DialogHeader>
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="例: 山田太郎"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) setName(draft);
          }}
        />
        <DialogFooter>
          <Button disabled={!draft.trim()} onClick={() => setName(draft)}>
            はじめる
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
