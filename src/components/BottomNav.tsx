"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Home, Carrot, CalendarDays, Settings, type LucideIcon } from "lucide-react";

const TABS: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: "/", label: "오늘", Icon: Home },
  { href: "/ingredients", label: "재료", Icon: Carrot },
  { href: "/history", label: "기록", Icon: CalendarDays },
  { href: "/settings", label: "설정", Icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();
  // 탭을 누른 순간 바로 색을 바꾼다. 서버 응답을 기다렸다가 바꾸면 "안 눌린 것" 같다.
  // from 을 같이 저장해서, 실제로 주소가 바뀐 뒤에는 진짜 pathname 을 따른다.
  const [target, setTarget] = useState<{ href: string; from: string } | null>(null);
  const optimistic = target && target.from === pathname ? target.href : null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 backdrop-blur"
      // 아이폰 홈 인디케이터에 탭이 가리지 않게
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md">
        {TABS.map(({ href, label, Icon }) => {
          const here = href === "/" ? pathname === "/" : pathname.startsWith(href);
          const active = optimistic ? optimistic === href : here;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                onClick={() => setTarget({ href, from: pathname })}
                className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors ${
                  active ? "text-peach" : "text-muted"
                }`}
              >
                <Tab label={label} Icon={Icon} active={active} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Link 안에서만 쓸 수 있는 useLinkStatus 로, 이동 중이면 아이콘을 깜빡인다 */
function Tab({ label, Icon, active }: { label: string; Icon: LucideIcon; active: boolean }) {
  const { pending } = useLinkStatus();
  return (
    <>
      <span className={pending ? "animate-pulse" : undefined}>
        <Icon size={22} strokeWidth={active ? 2.6 : 2} />
      </span>
      {label}
    </>
  );
}
