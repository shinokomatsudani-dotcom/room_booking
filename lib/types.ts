export type Equipment =
  | "プロジェクター"
  | "ホワイトボード"
  | "Web会議機器"
  | "モニター";

export const EQUIPMENT_OPTIONS: Equipment[] = [
  "プロジェクター",
  "ホワイトボード",
  "Web会議機器",
  "モニター",
];

export type Room = {
  id: string;
  name: string;
  location: string;
  capacity: number;
  equipment: Equipment[];
  openHour: number;
  closeHour: number;
};

export type Reservation = {
  id: string;
  roomId: string;
  title: string;
  startAt: string;
  endAt: string;
  organizer: string;
  attendeeCount: number;
};

export type ReservationInput = Omit<Reservation, "id">;

export type ReservationResult =
  | { ok: true; reservation: Reservation }
  | { ok: false; error: string };
