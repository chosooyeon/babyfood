import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Screen from "@/components/Screen";
import { Card } from "@/components/ui";
import SubmitButton from "@/components/SubmitButton";
import { getBaby } from "@/lib/queries";
import { saveBaby } from "../actions";
import { dayCount, monthsOld, stageOf, STAGES } from "@/lib/stage";
import { track } from "@/lib/track";
import { getHousehold } from "@/lib/household";
import { formatHouseholdCode } from "@/lib/household-code";
import HouseholdForm from "./HouseholdForm";
import { APP_VERSION } from "@/lib/version";
import DeleteHousehold from "./DeleteHousehold";

/** 한 집의 설정만 보이는 화면이라 검색에 나올 이유가 없다 */
export const metadata: Metadata = {
  title: "설정",
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

/** 설정 아래 "더 보기" 줄 — 주소 · 아이콘 · 이름 · 한 줄 설명 */
const MORE: [string, string, string, string][] = [
  ["/settings/contact", "✉️", "문의·제보", "시간표가 다르거나, 불편하거나, 건의할 게 있으면"],
  ["/guide", "📖", "앱 소개", "처음 보는 사람에게 보내는 카드. 저장해서 공유할 수 있어요"],
];

export default async function SettingsPage() {
  await track("/settings");
  const [baby, household] = await Promise.all([getBaby(), getHousehold()]);
  const months = baby ? monthsOld(baby.birth_date) : 0;
  const stage = baby ? stageOf(months) : null;

  return (
    <Screen title="설정">
      <Card>
        <h2 className="text-sm font-extrabold">아기 정보</h2>
        <p className="mt-1 text-xs text-muted">
          생년월일 하나면 D+일차·개월수·이유식 단계가 전부 자동으로 계산돼요.
        </p>

        <form action={saveBaby} className="mt-4 space-y-3">
          {baby ? <input type="hidden" name="id" value={baby.id} /> : null}
          <label className="block">
            <span className="text-xs font-semibold text-muted">이름</span>
            <input
              name="name"
              defaultValue={baby?.name ?? ""}
              placeholder="예: 서연"
              className="mt-1 w-full rounded-2xl border border-line bg-cream px-4 py-3 outline-none focus:border-peach"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-muted">생년월일</span>
            <input
              name="birth_date"
              type="date"
              defaultValue={baby?.birth_date ?? ""}
              className="mt-1 w-full rounded-2xl border border-line bg-cream px-4 py-3 outline-none focus:border-peach"
            />
          </label>
          <SubmitButton
            pendingLabel="저장 중…"
            className="w-full rounded-2xl bg-peach py-3.5 font-bold text-white active:scale-[.98]"
          >
            저장
          </SubmitButton>
          <p className="text-center text-[11px] leading-relaxed text-muted">
            저장하면{" "}
            <Link href="/terms" className="underline">
              이용약관
            </Link>
            과{" "}
            <Link href="/privacy" className="underline">
              개인정보처리방침
            </Link>
            에 동의한 것으로 봐요. 이름은 별명도 괜찮아요.
          </p>
        </form>

        {baby && stage ? (
          <p className="mt-3 rounded-2xl bg-sand px-4 py-3 text-xs text-muted">
            지금 <b className="text-ink">D+{dayCount(baby.birth_date)}</b> · 생후{" "}
            <b className="text-ink">{months}개월</b> · {stage.emoji}{" "}
            <b className="text-ink">{stage.label} 이유식</b>
          </p>
        ) : null}
      </Card>

      <Card className="mt-4">
        <h2 className="text-sm font-extrabold">이 수첩의 코드</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          기록은 이 코드로 묶여요. 다른 폰이나 아빠 폰에서 같이 보려면 거기 설정 탭에 이 코드를
          넣으세요. 코드를 아는 사람은 누구나 이 기록을 보고 고칠 수 있으니 가족에게만 알려주세요.
        </p>
        <p className="mt-3 select-all rounded-2xl bg-sand px-4 py-3 text-center font-mono text-lg font-extrabold tracking-[.2em]">
          {formatHouseholdCode(household)}
        </p>
        <p className="mt-4 text-xs font-semibold text-muted">다른 기기의 기록 이어 쓰기</p>
        <HouseholdForm />
        <p className="mt-2 text-[11px] leading-relaxed text-muted">
          폰을 바꾸거나 브라우저 데이터를 지우면 새 수첩이 열려요. 코드를 메모해 두면 언제든 되찾을 수
          있어요.
        </p>
        <DeleteHousehold />
      </Card>

      <Card className="mt-4">
        <h2 className="text-sm font-extrabold">단계 기준</h2>
        <ul className="mt-3 space-y-2.5">
          {STAGES.map((s) => (
            <li key={s.id} className="flex gap-3 text-xs">
              <span className="text-base">{s.emoji}</span>
              <div>
                <b className="text-[13px]">
                  {s.label} · {s.fromMonth}개월~
                </b>
                <p className="text-muted">
                  {s.meals} · {s.texture} · 1회 {s.amount}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] leading-relaxed text-muted [word-break:keep-all]">
          출처: 식약처·대한소아과학회 공개 지침을 정리한 일반 기준이에요. 보고 계신 이유식 책과 다르면 책 이름·쪽수와
          함께 알려주세요. 확인하고 맞출게요.
        </p>
      </Card>


      {/* 더 보기 — 설정 밖 화면으로 가는 줄 목록. 아이콘 · 이름 · 한 줄 설명 · 화살표 */}
      <Card className="mt-4 p-2">
        <ul className="divide-y divide-line">
          {MORE.map(([href, emoji, label, desc]) => (
            <li key={href}>
              <Link href={href} className="flex items-center gap-3 rounded-2xl px-3 py-3 active:bg-sand">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sand text-lg">{emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold">{label}</span>
                  <span className="block truncate text-[11px] text-muted">{desc}</span>
                </span>
                <ChevronRight size={16} className="shrink-0 text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      <p className="mt-6 text-center text-[11px] text-muted">
        <Link href="/privacy" className="underline">
          개인정보처리방침
        </Link>
        {" · "}
        <Link href="/terms" className="underline">
          이용약관
        </Link>
      </p>
      <p className="mt-2 text-center text-[11px] text-muted">이유식 수첩 v{APP_VERSION}</p>
    </Screen>
  );
}
