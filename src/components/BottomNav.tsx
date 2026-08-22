"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Carrot, CalendarDays, Settings } from "lucide-react";

const TABS = [
  { href: "/", label: "오늘", Icon: Home },
  { href: "/ingredients", label: "재료", Icon: Carrot },
  { href: "/history", label: "기록", Icon: CalendarDays },
  { href: "/settings", label: "설정", Icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 backdrop-blur"
      // 아이폰 홈 인디케이터에 탭이 가리지 않게
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md">
        {TABS.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors ${
                  active ? "text-peach" : "text-muted"
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.6 : 2} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
