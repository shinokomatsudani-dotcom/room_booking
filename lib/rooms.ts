import type { Room } from "@/lib/types";

export const ROOMS: Room[] = [
  {
    id: "room-1",
    name: "会議室A",
    location: "3F 東側",
    capacity: 4,
    equipment: ["ホワイトボード", "モニター"],
    openHour: 9,
    closeHour: 19,
  },
  {
    id: "room-2",
    name: "会議室B",
    location: "3F 西側",
    capacity: 8,
    equipment: ["プロジェクター", "Web会議機器", "ホワイトボード"],
    openHour: 9,
    closeHour: 19,
  },
  {
    id: "room-3",
    name: "会議室C（小会議室）",
    location: "4F 東側",
    capacity: 2,
    equipment: ["モニター"],
    openHour: 9,
    closeHour: 19,
  },
  {
    id: "room-4",
    name: "大会議室",
    location: "4F 中央",
    capacity: 20,
    equipment: ["プロジェクター", "Web会議機器", "ホワイトボード", "モニター"],
    openHour: 9,
    closeHour: 19,
  },
  {
    id: "room-5",
    name: "会議室E",
    location: "5F 西側",
    capacity: 6,
    equipment: ["Web会議機器", "モニター"],
    openHour: 9,
    closeHour: 19,
  },
];

export function getRoomById(roomId: string): Room | undefined {
  return ROOMS.find((room) => room.id === roomId);
}
