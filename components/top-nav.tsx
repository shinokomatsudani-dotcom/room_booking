"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/use-current-user";

const ITEMS = [
  { href: "/", label: "タイムライン" },
  { href: "/rooms", label: "会議室一覧" },
  { href: "/my-reservations", label: "自分の予約" },
];

export function TopNav() {
  const pathname = usePathname();
  const { name } = useCurrentUser();

  return (
    <header className="hidden items-center justify-between border-b px-6 py-3 md:flex">
      <div className="flex items-center gap-8">
        <span className="font-heading text-sm font-semibold">会議室予約</span>
        <nav className="flex gap-4">
          {ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "text-sm",
                pathname === href
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
      {name && <span className="text-sm text-muted-foreground">{name} さん</span>}
    </header>
  );
}
