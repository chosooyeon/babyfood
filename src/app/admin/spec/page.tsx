import { cookies } from "next/headers";
import { Card } from "@/components/ui";
import { ADMIN_COOKIE, isAdmin } from "@/lib/admin-auth";
import { CATEGORIES, INGREDIENTS } from "@/data/ingredients";
import { STAGES } from "@/lib/stage";
import { OBSERVE_DAYS, REACTION_META, SYMPTOM_META } from "@/lib/types";
import AdminLogin from "../AdminLogin";
import Shell from "../Shell";

export const dynamic = "force-dynamic";

/**
 * 기획서. "내 앱인데 무슨 기능이 있는지 모르겠다"를 위해 쓴다.
 * 숫자·표는 전부 코드에서 읽어오므로 재료를 추가하거나 단계를 고치면 여기도 따라 바뀐다.
 * 글은 사람이 쓴 것이라 기능을 더하면 같이 고친다.
 */
export default async function SpecPage() {
  if (!(await isAdmin((await cookies()).get(ADMIN_COOKIE)?.value))) {
    return (
      <Shell>
        <AdminLogin />
      </Shell>
    );
  }

  const byCategory = CATEGORIES.map((c) => [c, INGREDIENTS.filter((i) => i.category === c).length] as const);
  const byRisk = (["low", "mid", "high"] as const).map(
    (r) => [r, INGREDIENTS.filter((i) => i.risk === r).length] as const
  );
  const banned = INGREDIENTS.filter((i) => i.banned);
  const riskLabel = { low: "낮음", mid: "중간", high: "높음" };

  return (
    <Shell tab="spec">
      <Card className="bg-peach-soft/60">
        <p className="text-xs font-bold text-muted">이유식 수첩</p>
        <h1 className="mt-1 text-lg font-extrabold leading-snug">
          새 재료를 하나씩, {OBSERVE_DAYS}일씩 지켜보며 먹이게 만드는 기록 앱
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink/80">
          두 재료를 같이 넣으면 반응이 나왔을 때 어느 쪽인지 알 수 없다. 그래서 이 앱은 끼니를
          적는 것보다 <b>“지금 새 재료 넣어도 되나”</b>를 알려주는 데 집중한다. 아기 생년월일
          하나만 넣으면 단계·추천·잠금이 전부 거기서 계산된다.
        </p>
      </Card>

      <Section title="앱이 알아서 하는 것" sub="사용자가 누르지 않아도 돌아가는 규칙">
        <Rules
          items={[
            ["생년월일 → 모든 것", "D+일차, 만 개월수, 이유식 단계, 재료 잠금을 생년월일에서 계산한다. 설정은 이것 하나."],
            [`새 재료 = ${OBSERVE_DAYS}일 관찰 시작`, "끼니에 처음 보는 재료를 넣으면 그날부터 관찰이 자동으로 시작된다. 따로 누를 게 없다."],
            ["관찰은 날짜에서 저절로 끝남", `${OBSERVE_DAYS}일이 지나면 ‘먹어봄(안전)’으로 바뀐다. DB 에 쓰지 않고 볼 때마다 계산하므로 앱을 며칠 안 열어도 틀어지지 않는다.`],
            ["관찰 중엔 추천 없음", "관찰 중인 재료가 하나라도 있으면 ‘다음 재료 추천’이 비고, 끼니 기록 시트에 경고가 뜬다."],
            ["새 재료 2개 이상 경고", "한 끼에 처음 먹는 재료를 둘 이상 고르면 빨간 경고. 막지는 않는다 (부모가 판단)."],
            ["월령 미달 잠금", "재료마다 시작 월령이 있다. 아직 안 된 재료는 회색 잠금으로 보이고 기본 목록에서 숨는다."],
            ["절대 금지 재료", `${banned.map((b) => b.name).join(", ")} 은 사유와 함께 빨갛게 표시된다.`],
            ["추천 순서", "안 먹여봤고 + 월령 됐고 + 금지 아닌 것 중에서, 알레르기 위험 낮은 것 → 일찍 열린 것 순으로 6개."],
          ]}
        />
      </Section>

      <Section title="화면 5개">
        <Screens
          items={[
            ["오늘", "홈", [
              "날짜 · 이름 · D+일차 · 개월 · 단계, 단계별 횟수/농도/1회 분량",
              "다음 단계 14일 전부터 ‘N일 뒤 중기로 넘어가요’",
              "관찰 중 배너: 며칠째인지, 언제 풀리는지, ‘괜찮아요’로 바로 안전 처리 또는 ‘이상반응’ 기록",
              "오늘 먹은 것 목록 (끼니 번호, 메뉴, 재료 이모지, 반응, 양, 메모, 삭제)",
              "끼니 추가 시트: 메뉴 이름, 반응 3종, 양(ml), 재료 검색·카테고리 선택, 메모",
              "다음에 시도해볼 재료 6개 + 도장깨기 진행률",
            ]],
            ["재료", "도장깨기", [
              `재료 ${INGREDIENTS.length}개를 카테고리별 그리드로. 상태: 안 먹어봄 / 먹어봄 / 관찰중 / 이상반응 / 잠김`,
              "필터: 전체 · 먹어봄 · 안 먹어봄 · 관찰중 · 이상반응",
              "재료를 누르면 시작 월령, 출처, 조리 팁, 관찰 해제일, 기록된 증상이 뜬다",
              "이상반응 기록 / ‘괜찮았어요’로 취소",
            ]],
            ["기록", "타임라인", [
              "이상반응이 있던 재료 목록을 맨 위에 (병원에서 보여주는 용도)",
              "날짜별 끼니 타임라인, 각 날짜에 D+일차 표시, 최근 120끼",
            ]],
            ["설정", "", [
              "아기 이름 · 생년월일 저장",
              "지금 단계와 단계표 (초기~완료기 시작 월령)",
            ]],
            ["관리", "/admin · 탭에 없음", [
              "ADMIN_KEY 로 잠김. 현황(DB 연결·용량·방문·기기·응답속도)과 이 기획서",
              "방문 기록은 90일 지나면 자동 삭제, IP 는 해시 앞자리만",
            ]],
          ]}
        />
      </Section>

      <Section title="이유식 단계" sub="만 개월수로 자동 판정 · 식약처·소아과학회 공개 지침 기준">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-[11px] text-muted">
              <th className="pb-2 font-semibold">단계</th>
              <th className="pb-2 font-semibold">시작</th>
              <th className="pb-2 font-semibold">횟수</th>
              <th className="pb-2 font-semibold">1회</th>
            </tr>
          </thead>
          <tbody>
            {STAGES.map((s) => (
              <tr key={s.id} className="border-t border-line align-top">
                <td className="py-2 font-bold">
                  {s.emoji} {s.label}
                </td>
                <td className="py-2 tabular-nums">{s.fromMonth}개월</td>
                <td className="py-2">{s.meals}</td>
                <td className="py-2">{s.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <ul className="mt-3 space-y-1 text-[11px] text-muted">
          {STAGES.map((s) => (
            <li key={s.id}>
              <b className="text-ink/70">{s.label}</b> · {s.texture}
            </li>
          ))}
        </ul>
      </Section>

      <Section title={`재료 사전 · ${INGREDIENTS.length}개`} sub="src/data/ingredients.ts 에서 읽어옴">
        <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
          {byCategory.map(([c, n]) => (
            <span key={c} className="rounded-full bg-sand px-2.5 py-1">
              {c} {n}
            </span>
          ))}
        </div>
        <p className="mt-3 text-[11px] font-bold text-muted">알레르기 위험도</p>
        <div className="mt-1 flex gap-1.5 text-[11px] font-bold">
          {byRisk.map(([r, n]) => (
            <span key={r} className="rounded-full bg-sand px-2.5 py-1">
              {riskLabel[r]} {n}
            </span>
          ))}
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-muted">
          위험도는 “늦게 먹이라”가 아니라 “관찰을 더 조심히”라는 뜻. 추천 순서에만 쓴다.
        </p>
        <p className="mt-3 text-[11px] font-bold text-muted">절대 금지</p>
        <ul className="mt-1 space-y-1 text-xs">
          {banned.map((b) => (
            <li key={b.id}>
              <b>
                {b.emoji} {b.name}
              </b>{" "}
              <span className="text-muted">{b.banned}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="기록하는 항목">
        <p className="text-[11px] font-bold text-muted">끼니 한 번에</p>
        <p className="mt-1 text-xs leading-relaxed">
          날짜 · 그날 몇 번째 끼니(자동) · 메뉴 이름 · 들어간 재료들 · 양(ml, 선택) · 반응 · 메모(선택)
        </p>
        <p className="mt-3 text-[11px] font-bold text-muted">반응</p>
        <div className="mt-1 flex gap-1.5 text-xs font-bold">
          {Object.values(REACTION_META).map((r) => (
            <span key={r.label} className="rounded-full bg-sand px-2.5 py-1">
              {r.emoji} {r.label}
            </span>
          ))}
        </div>
        <p className="mt-3 text-[11px] font-bold text-muted">이상반응 증상 (복수 선택 + 메모)</p>
        <div className="mt-1 flex flex-wrap gap-1.5 text-xs font-bold">
          {Object.values(SYMPTOM_META).map((s) => (
            <span key={s.label} className="rounded-full bg-sand px-2.5 py-1">
              {s.emoji} {s.label}
            </span>
          ))}
        </div>
      </Section>

      <Section title="데이터와 운영">
        <Rules
          items={[
            ["테이블 3 + 1", "babies(아기) · meals(끼니) · trials(재료별 첫 도입일·상태·증상) · visits(관리용 방문 기록)"],
            ["DB 는 서버에서만", "Supabase service_role 키는 서버 코드에만 있고 브라우저로 안 나간다. 주소를 안다고 DB 를 건드릴 수 없다."],
            ["안 멈추게", "Supabase 무료 플랜은 1주일 안 쓰면 멈추는데, Vercel cron 이 매일 아침 6시에 한 번 깨운다."],
            ["연결 실패 화면", "DB 가 응답 없으면 6초 안에 포기하고 ‘연결할 수 없어요’ + 다시 시도 버튼을 보여준다."],
            ["배포", "GitHub main 에 push → Vercel 자동 배포. 아이폰은 Safari 공유 → 홈 화면에 추가."],
          ]}
        />
      </Section>

      <Section title="아직 없는 것" sub="알고 쓰는 한계">
        <Rules
          items={[
            ["아기 한 명, 로그인 없음", "주소를 아는 사람은 누구나 같은 아기를 보고 기록을 추가할 수 있다. 여러 가족이 각자 쓰려면 계정이 필요하다."],
            ["재료 기준이 책이 아님", "시작 월령은 공개 지침 기준(출처 ‘표준’). 보는 책에 맞춰 고치려면 ingredients.ts 의 값과 출처를 함께 바꾼다."],
            ["사진·수유·수면 없음", "이유식 재료 도입에만 집중한다."],
            ["오프라인 불가", "기록·조회 모두 서버를 거친다."],
          ]}
        />
      </Section>
    </Shell>
  );
}

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <Card className="mt-4">
      <h2 className="text-sm font-extrabold">{title}</h2>
      {sub ? <p className="mt-0.5 text-[11px] text-muted">{sub}</p> : null}
      <div className="mt-3">{children}</div>
    </Card>
  );
}

function Rules({ items }: { items: [string, string][] }) {
  return (
    <ul className="divide-y divide-line">
      {items.map(([head, body]) => (
        <li key={head} className="py-2 first:pt-0 last:pb-0">
          <p className="text-xs font-bold">{head}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">{body}</p>
        </li>
      ))}
    </ul>
  );
}

function Screens({ items }: { items: [string, string, string[]][] }) {
  return (
    <ul className="space-y-4">
      {items.map(([name, tag, feats]) => (
        <li key={name}>
          <p className="text-xs font-extrabold">
            {name} {tag ? <span className="ml-1 font-semibold text-muted">{tag}</span> : null}
          </p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs leading-relaxed text-ink/80">
            {feats.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
