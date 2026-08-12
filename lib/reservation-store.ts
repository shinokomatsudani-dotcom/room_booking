import type { Reservation, ReservationInput, ReservationResult } from "@/lib/types";
import { getRoomById } from "@/lib/rooms";
import { formatDateTime } from "@/lib/format";

const STORAGE_KEY = "room-booking:reservations";

type Listener = () => void;

let reservations: Reservation[] = [];
let hydrated = false;
const listeners = new Set<Listener>();

function atToday(hour: number, minute = 0, dayOffset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function buildSeed(): Reservation[] {
  // 「今すぐ使える会議室」の見え方を確認しやすいよう、現在時刻をまたぐ予約を1件必ず作る。
  const ongoingStartHour = Math.max(9, Math.min(18, new Date().getHours()));

  return [
    {
      id: "seed-1",
      roomId: "room-2",
      title: "定例ミーティング",
      startAt: atToday(ongoingStartHour, 0),
      endAt: atToday(ongoingStartHour + 1, 0),
      organizer: "山田太郎",
      attendeeCount: 5,
    },
    {
      id: "seed-2",
      roomId: "room-1",
      title: "採用面談",
      startAt: atToday(14, 0),
      endAt: atToday(15, 0),
      organizer: "佐藤花子",
      attendeeCount: 2,
    },
    {
      id: "seed-3",
      roomId: "room-4",
      title: "全社キックオフ",
      startAt: atToday(10, 0),
      endAt: atToday(11, 30),
      organizer: "鈴木一郎",
      attendeeCount: 18,
    },
    {
      id: "seed-4",
      roomId: "room-2",
      title: "クライアント商談",
      startAt: atToday(16, 0),
      endAt: atToday(17, 0),
      organizer: "田中実",
      attendeeCount: 4,
    },
    {
      id: "seed-5",
      roomId: "room-3",
      title: "1on1",
      startAt: atToday(13, 0),
      endAt: atToday(13, 30),
      organizer: "高橋あゆみ",
      attendeeCount: 2,
    },
    {
      id: "seed-6",
      roomId: "room-5",
      title: "朝会",
      startAt: atToday(9, 30),
      endAt: atToday(10, 0),
      organizer: "伊藤誠",
      attendeeCount: 5,
    },
    {
      id: "seed-7",
      roomId: "room-1",
      title: "経営会議",
      startAt: atToday(10, 0, 1),
      endAt: atToday(11, 0, 1),
      organizer: "中村優子",
      attendeeCount: 3,
    },
    {
      id: "seed-8",
      roomId: "room-4",
      title: "全体研修",
      startAt: atToday(14, 0, 1),
      endAt: atToday(16, 0, 1),
      organizer: "小林大輔",
      attendeeCount: 15,
    },
  ];
}

function readFromStorage(): Reservation[] | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Reservation[]) : null;
  } catch {
    return null;
  }
}

function persist() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
}

function notify() {
  listeners.forEach((listener) => listener());
}

function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  // Seed reservations are recomputed relative to "now" on every load (and
  // replace any stale seed-* entries) so the demo data always lines up with
  // today, instead of freezing at whatever date it was first generated.
  const userReservations = (readFromStorage() ?? []).filter((r) => !r.id.startsWith("seed-"));
  reservations = [...buildSeed(), ...userReservations];
  persist();
}

export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): Reservation[] {
  ensureHydrated();
  return reservations;
}

export function getServerSnapshot(): Reservation[] {
  return reservations;
}

function isOverlapping(
  roomId: string,
  startAt: string,
  endAt: string,
  excludeId?: string
): Reservation | undefined {
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();
  return reservations.find((r) => {
    if (r.roomId !== roomId || r.id === excludeId) return false;
    const rStart = new Date(r.startAt).getTime();
    const rEnd = new Date(r.endAt).getTime();
    return start < rEnd && end > rStart;
  });
}

export function createReservation(input: ReservationInput): ReservationResult {
  ensureHydrated();

  const start = new Date(input.startAt);
  const end = new Date(input.endAt);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { ok: false, error: "日時を正しく入力してください。" };
  }
  if (start.getTime() >= end.getTime()) {
    return { ok: false, error: "終了時間は開始時間より後にしてください。" };
  }
  if (start.getTime() < Date.now()) {
    return {
      ok: false,
      error: `過去の時間には予約できません（現在: ${formatDateTime(new Date())}）。日付を確認してください。`,
    };
  }

  const room = getRoomById(input.roomId);
  if (!room) {
    return { ok: false, error: "会議室が見つかりません。" };
  }
  if (input.attendeeCount > room.capacity) {
    return {
      ok: false,
      error: `定員${room.capacity}名の会議室に${input.attendeeCount}名は予約できません。`,
    };
  }

  const conflict = isOverlapping(input.roomId, input.startAt, input.endAt);
  if (conflict) {
    return {
      ok: false,
      error: `この時間帯は「${conflict.title}」で予約済みです。`,
    };
  }

  const reservation: Reservation = { ...input, id: crypto.randomUUID() };
  reservations = [...reservations, reservation];
  persist();
  notify();
  return { ok: true, reservation };
}
