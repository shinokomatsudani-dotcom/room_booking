"use client";

import { EQUIPMENT_OPTIONS, type Equipment } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export type RoomFilters = {
  equipment: Equipment[];
  minCapacity: number | null;
};

export function EquipmentFilter({
  filters,
  onChange,
}: {
  filters: RoomFilters;
  onChange: (filters: RoomFilters) => void;
}) {
  function toggleEquipment(item: Equipment, checked: boolean) {
    onChange({
      ...filters,
      equipment: checked
        ? [...filters.equipment, item]
        : filters.equipment.filter((e) => e !== item),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label className="text-xs text-muted-foreground">必要な設備</Label>
        <div className="flex flex-col gap-2">
          {EQUIPMENT_OPTIONS.map((item) => (
            <div key={item} className="flex items-center gap-2">
              <Checkbox
                id={`equipment-${item}`}
                checked={filters.equipment.includes(item)}
                onCheckedChange={(checked) => toggleEquipment(item, checked === true)}
              />
              <Label htmlFor={`equipment-${item}`} className="text-sm font-normal">
                {item}
              </Label>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="min-capacity" className="text-xs text-muted-foreground">
          参加人数（最低定員）
        </Label>
        <Input
          id="min-capacity"
          type="number"
          min={0}
          placeholder="例: 5"
          value={filters.minCapacity ?? ""}
          onChange={(e) =>
            onChange({
              ...filters,
              minCapacity: e.target.value ? Number(e.target.value) : null,
            })
          }
          className="w-28"
        />
      </div>
    </div>
  );
}

export function roomMatchesFilters(
  room: { capacity: number; equipment: Equipment[] },
  filters: RoomFilters
): boolean {
  if (filters.minCapacity !== null && room.capacity < filters.minCapacity) {
    return false;
  }
  return filters.equipment.every((e) => room.equipment.includes(e));
}
