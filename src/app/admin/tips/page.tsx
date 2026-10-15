import { cookies } from "next/headers";
import { Check, ExternalLink, Undo2 } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { ko } from "date-fns/locale";
import { Card } from "@/components/ui";
import SubmitButton from "@/components/SubmitButton";
import { ADMIN_COOKIE, isAdmin } from "@/lib/admin-auth";
import { getTips } from "@/lib/samples-queries";
import { formatHouseholdCode } from "@/lib/household-code";
import { SAMPLES_SOURCE } from "@/data/samples";
import AdminLogin from "../AdminLogin";
import Shell from "../Shell";
import { setTipDone } from "../actions";

export const dynamic = "force-dynamic";

/**
 * 문의·제보함 (/settings/contact 에서 들어온다). 읽고 코드를 고친 뒤 "반영함"을 누른다.
 * 제보는 코드에 자동 반영되지 않는다 — 누가 적어도 되는 폼이라 사람이 한 번 봐야 한다.
 */
export default async function TipsPage() {
  if (!(await isAdmin((await cookies()).get(ADMIN_COOKIE)?.value))) {
    return (
      <Shell>
        <AdminLogin />
      </Shell>
    );
  }
  const tips = await getTips();
  const open = tips.filter((t) => !t.done);
  const done = tips.filter((t) => t.done);

  return (
    <Shell tab="tips">
      <Card className="bg-peach-soft/60">
        <p className="text-xs font-bold text-muted">문의·제보함</p>
        <p className="mt-1 text-sm leading-relaxed text-ink/80">
          /settings/contact 로 들어온 것. 주제가 체험팩이면 <code className="rounded bg-card px-1">src/data/samples.ts</code>
          (지금 출처 <b>{SAMPLES_SOURCE}</b>), 재료·단계 기준이면{" "}
          <code className="rounded bg-card px-1">src/data/ingredients.ts</code> · <code className="rounded bg-card px-1">src/lib/stage.ts</code>{" "}
          를 고친 뒤 “반영함”을 눌러요.
        </p>
      </Card>

      <h2 className="mt-5 mb-2 text-sm font-extrabold">
        확인할 것 {open.length > 0 ? <span className="ml-1 rounded-full bg-peach px-2 py-0.5 text-[11px] text-white">{open.length}</span> : null}
      </h2>
      {open.length === 0 ? <p className="text-sm text-muted">새 제보가 없어요.</p> : <TipList tips={open} />}

      {done.length > 0 ? (
        <>
          <h2 className="mt-6 mb-2 text-sm font-extrabold text-muted">반영한 것 · {done.length}</h2>
          <TipList tips={done} />
        </>
      ) : null}
    </Shell>
  );
}

function TipList({ tips }: { tips: Awaited<ReturnType<typeof getTips>> }) {
  return (
    <ul className="space-y-2">
      {tips.map((t) => (
        <li key={t.id}>
          <Card className={`p-3.5 ${t.done ? "opacity-60" : ""}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-extrabold">{t.brand}</p>
                <p className="mt-1 text-xs leading-relaxed whitespace-pre-wrap break-words">{t.detail}</p>
                {t.url ? (
                  <a
                    href={t.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="mt-1 inline-flex max-w-full items-center gap-1 text-[11px] text-peach underline underline-offset-2"
                  >
                    <span className="truncate">{t.url}</span> <ExternalLink size={11} className="shrink-0" />
                  </a>
                ) : null}
                <p className="mt-1.5 text-[11px] text-muted">
                  {formatDistanceToNowStrict(new Date(t.created_at), { addSuffix: true, locale: ko })} · 수첩{" "}
                  {formatHouseholdCode(t.household).slice(0, 4)}…
                </p>
              </div>
              <form action={setTipDone} className="shrink-0">
                <input type="hidden" name="id" value={t.id} />
                <input type="hidden" name="done" value={t.done ? "0" : "1"} />
                <SubmitButton
                  className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${
                    t.done ? "bg-sand text-muted" : "bg-mint-soft text-ink"
                  }`}
                >
                  {t.done ? (
                    <>
                      <Undo2 size={11} /> 되돌리기
                    </>
                  ) : (
                    <>
                      <Check size={11} /> 반영함
                    </>
                  )}
                </SubmitButton>
              </form>
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}
