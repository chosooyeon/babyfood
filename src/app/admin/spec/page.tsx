import { cookies } from "next/headers";
import { Card } from "@/components/ui";
import { ADMIN_COOKIE, isAdmin } from "@/lib/admin-auth";
import { CATEGORIES, INGREDIENTS } from "@/data/ingredients";
import { SAMPLE_BRANDS, TIPS_PER_DAY } from "@/data/samples";
import { ALARM_CHOICES, DEFAULT_ALARM } from "@/lib/samples";
import { STAGES } from "@/lib/stage";
import { OBSERVE_DAYS, REACTION_META, SYMPTOM_META } from "@/lib/types";
import { HH_LEN } from "@/lib/household-code";
import AdminLogin from "../AdminLogin";
import Shell from "../Shell";
import Slides from "../Slides";

export const dynamic = "force-dynamic";

/**
 * 기획서. "내 앱인데 무슨 기능이 있는지 모르겠다"를 위해 쓴다.
 * 화면이 뭘 하는지는 여기 한 곳에만 적는다 (README 는 운영 절차, /guide 는 소개 문구).
 * 숫자·표는 전부 코드에서 읽어오므로 재료·브랜드를 추가하거나 단계를 고치면 여기도 따라 바뀐다.
 * 글은 사람이 쓴 것이라 기능을 더하면 같이 고친다.
 */

const timedBrands = SAMPLE_BRANDS.filter(
  (b) => b.rule.kind !== "always",
).length;
const alarmRange = `${ALARM_CHOICES[0]}~${ALARM_CHOICES[ALARM_CHOICES.length - 1]}분`;

/** 화면 목록 — 제목의 개수는 이 배열 길이에서 나온다 */
const SCREENS: [string, string, string[]][] = [
  [
    "오늘",
    "홈",
    [
      "날짜 · 이름 · D+일차 · 개월 · 단계, 단계별 횟수/농도/1회 분량",
      "다음 단계 14일 전부터 ‘N일 뒤 중기로 넘어가요’",
      "관찰 중 배너: 며칠째인지, 언제 풀리는지, ‘괜찮아요’로 바로 안전 처리 또는 ‘이상반응’ 기록",
      "수유 시계: 24시간 파이에 먹인 시각마다 30분짜리 조각을 가운데까지 칠함 (이유식 복숭아색, 분유 하늘색). 가운데 작은 원 안에 끼니 수·분유 횟수·ml 과 ‘N분 전에 먹었어요’, 파이 바깥에 지금 표시. ‘먹인 것 보기’ 링크",
      "분유 빠른 기록: 시각(기본 지금)·ml 만 넣고 추가. 자주 쓰는 양 칩",
      "끼니 추가 시트: 메뉴 이름, 반응 3종, 양(ml), 재료 검색·카테고리 선택, 메모. 먹인 시각은 시트를 연 시간으로 자동 저장, ‘시각 바꾸기’로 고침",
      "다음에 시도해볼 재료 6개, 그 아래 ‘재료 도장깨기’ 진행률 카드 → 재료 화면",
    ],
  ],
  [
    "먹인 것",
    "/feeds",
    [
      "베이비타임식 7일 차트: 하루가 세로줄 하나(0시 위 → 24시 아래, 1시간 20px), 열 너비를 채운 막대 안에 시각 — 복숭아색 이유식·하늘색 분유, 밤(21~7시)은 어둡게, 3시간마다 눈금. 열 아래 끼니 수·분유 횟수",
      "‹ › 로 일주일씩 이동(?end=), 열을 누르면 그날 선택(?d=)",
      "고른 날의 목록 — 끼니(복숭아색 줄)와 분유(하늘색 줄)가 시각순으로 한 줄씩: 시각 · 메뉴 · 재료 이모지 · 반응 · 양 · 삭제",
    ],
  ],
  [
    "재료 도장깨기",
    "/ingredients · 오늘 탭의 진행률 카드에서 (하단 탭 아님, 뒤로가기로 돌아옴)",
    [
      `재료 ${INGREDIENTS.length}개를 카테고리별 그리드로. 상태: 안 먹어봄 / 먹어봄 / 관찰중 / 이상반응 / 잠김`,
      "필터: 전체 · 먹어봄 · 안 먹어봄 · 관찰중 · 이상반응",
      "재료를 누르면 시작 월령, 출처, 조리 팁, 관찰 해제일, 기록된 증상이 뜬다",
      "이상반응 기록 / ‘괜찮았어요’로 취소",
    ],
  ],
  [
    "기록",
    "타임라인",
    [
      "이상반응이 있던 재료 목록을 맨 위에 (병원에서 보여주는 용도)",
      "이유식 현황 달력: 날마다 들어간 재료 이모지(최대 3개 + N), 처음 먹인 재료 초록 점·이상반응 빨간 점·거부 노란 점. ‹ › 로 달 이동 (?m=YYYY-MM)",
      "날짜별 타임라인 — 달력이 보는 달, 먹인 것 탭과 같은 한 줄 박스(끼니 복숭아색·분유 하늘색)로 시각순, 각 날짜에 D+일차, 달력에서 날짜를 누르면 그날로 내려감",
    ],
  ],
  [
    "설정",
    "",
    [
      "아기 이름 · 생년월일 저장",
      "지금 단계와 단계표 (초기~완료기 시작 월령)",
      `수첩 코드(${HH_LEN}자리) 보기·다른 기기 코드로 이어 쓰기, ‘이 수첩 기록 모두 지우기’, 맨 아래 한 줄 두 칸(문의·제보 · 앱 소개), 버전 표시`,
      `문의·제보 /settings/contact — 주제(체험팩 시간표 · 재료·단계 기준 · 오류·불편 · 건의·기타)·내용·링크 한 폼으로 (집마다 하루 ${TIPS_PER_DAY}건) → /admin/tips`,
    ],
  ],
  [
    "체험팩",
    "/samples · 하단 탭 네 번째",
    [
      `시판 이유식 브랜드 ${SAMPLE_BRANDS.length}곳(시간 정해진 곳 ${timedBrands}). 맨 위에 가로 오픈 시간표 — 0~24시 한 줄에 24시간 안에 열리는 브랜드를 이모지·시각 칩으로(겹치면 아랫줄), 밤은 어둡게, 지금은 점선. 아래에 다음 오픈 브랜드 카운트다운·규칙·열기 버튼. 그 아래 브랜드 카드를 옆으로 넘기는 줄(오픈 순 · 언제든 신청 · 신청 끝)`,
      "브랜드마다 받을 수 있는 월령·비용, 펼치면 구성·조건. 아기 월령이 범위에 들면 ‘지금 맞아요’ 배지",
      "‘신청했어요’ 체크는 집(수첩 코드)마다 저장되고 아래 ‘신청 끝’으로 내려감",
      `오픈 알림(캘린더 구독, ${alarmRange} 전·기본 ${DEFAULT_ALARM}분)은 실제로 울리는지 확인될 때까지 숨김 (page.tsx 의 SHOW_ALARM)`,
      "화면 아래 ‘시간이 다르거나 빠진 브랜드 알려주기’ → /settings/contact (주제 미리 선택)",
    ],
  ],
  [
    "소개",
    "/guide · 설정 탭에서",
    [
      "처음 보는 사람에게 보내는 소개 카드 (src/app/guide/card-data.ts). 옆으로 넘기고, PNG 로 저장해 카톡·인스타로 보낼 수 있다. 기능이 바뀌면 글을 고치고 npm run cards",
    ],
  ],
  [
    "개인정보처리방침 · 이용약관",
    "/privacy · /terms · 설정 탭 바닥, 소개 페이지 바닥, 아기 등록 폼 아래에서",
    [
      "수집 항목·보관 기간·위탁처(Supabase, Vercel)·보호자 권리를 코드와 맞춰 적은 문서. 운영자·연락처·시행일은 src/data/legal.ts",
      "설정 탭 ‘이 수첩 기록 모두 지우기’ — 수첩 코드에 묶인 다섯 테이블을 지우고 새 코드 발급 (방침 5항)",
    ],
  ],
  [
    "관리",
    "/admin · 탭에 없음",
    [
      "ADMIN_KEY 로 잠김. 현황(DB 연결·용량·방문·기기·응답속도·체험팩 클릭) · 이 기획서 · 체험팩 제보함(반영함 체크)",
      "방문 기록은 90일 지나면 자동 삭제, IP 는 해시 앞자리만. 체험팩 클릭(sample_clicks)은 업체와 이야기할 숫자라 지우지 않는다",
      "관리 키로 들어온 기기는 \"나\"(bf_me 쿠키) — 그 기기의 방문·클릭은 mine=true 로 저장돼 통계에서 빠지고 목록에 나 표시. 로컬·프리뷰 서버도 항상 나",
      "체험팩 \"사이트 열기\"와 캘린더 알림 링크는 /go/{brand} 를 거친다 — 클릭 한 줄 남기고 302 로 공식 홈",
    ],
  ],
];
export default async function SpecPage() {
  if (!(await isAdmin((await cookies()).get(ADMIN_COOKIE)?.value))) {
    return (
      <Shell>
        <AdminLogin />
      </Shell>
    );
  }

  const byCategory = CATEGORIES.map(
    (c) => [c, INGREDIENTS.filter((i) => i.category === c).length] as const,
  );
  const byRisk = (["low", "mid", "high"] as const).map(
    (r) => [r, INGREDIENTS.filter((i) => i.risk === r).length] as const,
  );
  const banned = INGREDIENTS.filter((i) => i.banned);
  const riskLabel = { low: "낮음", mid: "중간", high: "높음" };

  const slides = [
    {
      id: "intro",
      title: "한 줄 소개",
      emoji: "🍚",
      content: (
        <>
          <Card className="bg-peach-soft/60">
            <p className="text-xs font-bold text-muted">이유식 수첩</p>
            <h1 className="mt-1 text-lg font-extrabold leading-snug">
              새 재료를 하나씩, {OBSERVE_DAYS}일씩 지켜보며 먹이게 만드는 기록 앱
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-ink/80">
              두 재료를 같이 넣으면 반응이 나왔을 때 어느 쪽인지 알 수 없다. 그래서 이 앱은 끼니를 적는 것보다{" "}
              <b>“지금 새 재료 넣어도 되나”</b>를 알려주는 데 집중한다. 아기 생년월일 하나만 넣으면 단계·추천·잠금이
              전부 거기서 계산된다.
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
        </>
      ),
    },
    {
      id: "screens",
      title: `화면 ${SCREENS.length}개`,
      emoji: "📱",
      content: <Screens items={SCREENS} />,
    },
    {
      id: "stages",
      title: "단계",
      emoji: "🥣",
      content: (
        <Section title="이유식 단계" sub="만 개월수로 자동 판정 · 식약처·소아과학회 공개 지침 기준" first>
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
      ),
    },
    {
      id: "ingredients",
      title: "재료",
      emoji: "🥕",
      content: (
        <Section title={`재료 사전 · ${INGREDIENTS.length}개`} sub="src/data/ingredients.ts 에서 읽어옴" first>
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
      ),
    },
    {
      id: "records",
      title: "기록 항목",
      emoji: "📝",
      content: (
        <Section title="기록하는 항목" first>
          <p className="text-[11px] font-bold text-muted">끼니 한 번에</p>
          <p className="mt-1 text-xs leading-relaxed">
            날짜 · 먹인 시각 · 그날 몇 번째 끼니(자동) · 메뉴 이름 · 들어간 재료들 · 양(ml, 선택) · 반응 · 메모(선택)
          </p>
          <p className="mt-3 text-[11px] font-bold text-muted">분유 한 번에</p>
          <p className="mt-1 text-xs leading-relaxed">날짜 · 먹인 시각 · 양(ml, 선택)</p>
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
      ),
    },
    {
      id: "data",
      title: "데이터",
      emoji: "🗄️",
      content: (
        <Section title="데이터" sub="운영 절차(셋업·배포·SQL·멈춤 복구)는 README 에만 적는다" first>
          <Rules
            items={[
              ["테이블 6 + 2", "babies(아기) · meals(끼니) · bottles(분유) · trials(재료별 첫 도입일·상태·증상) · sample_claims(체험팩 신청 체크) · tips(제보) 는 supabase/schema.sql. 관리용 visits(방문) · sample_clicks(체험팩 클릭) 는 supabase/admin.sql."],
              ["집 구분", `모든 행에 수첩 코드(household)가 붙고, 모든 읽기·쓰기가 그 코드로 거른다. 로그인 대신 ${HH_LEN}자리 코드를 기기 쿠키에 심는다.`],
              ["DB 는 서버에서만", "Supabase service_role 키는 서버 코드에만 있고 브라우저로 안 나간다. 주소를 안다고 DB 를 건드릴 수 없다."],
              ["연결 실패 화면", "DB 가 응답 없으면 6초 안에 포기하고 ‘연결할 수 없어요’ + 다시 시도 버튼을 보여준다."],
            ]}
          />
        </Section>
      ),
    },
    {
      id: "limits",
      title: "아직 없는 것",
      emoji: "🚧",
      content: (
        <Section title="아직 없는 것" sub="알고 쓰는 한계" first>
          <Rules
            items={[
              ["계정 없음", "수첩 코드를 아는 사람은 누구나 그 집 기록을 보고 고칠 수 있다. 비밀번호·복구 수단이 없으니 코드를 잃으면 기록도 잃는다."],
              ["집당 아기 한 명", "둘째는 아직 못 넣는다. 설정에서 생년월일을 바꾸면 기록이 섞인다."],
              ["체험팩 자동 신청 없음", "쇼핑몰 로그인·봇 방지 때문에 하지 않는다. 캘린더 알림까지만."],
              ["앱 푸시 알림 없음", "분 단위로 보내려면 분 단위로 도는 서버가 필요한데, 무료 Vercel cron 은 하루 한 번이다."],
              ["재료 기준이 책이 아님", "시작 월령은 공개 지침 기준(출처 ‘표준’). 보는 책에 맞춰 고치려면 ingredients.ts 의 값과 출처를 함께 바꾼다."],
              ["사진·수면 없음", "이유식 재료 도입과 수유 시각에만 집중한다."],
              ["오프라인 불가", "기록·조회 모두 서버를 거친다."],
            ]}
          />
        </Section>
      ),
    },
  ];

  return (
    <Shell tab="spec">
      <Slides slides={slides} />
    </Shell>
  );
}

function Section({
  title,
  sub,
  first = false,
  children,
}: {
  title: string;
  sub?: string;
  /** 슬라이드의 첫 카드면 위 여백 없음 */
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card className={first ? "" : "mt-3"}>
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
        <li key={head} className="py-2.5 first:pt-0 last:pb-0">
          <p className="text-xs font-bold">{head}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">{body}</p>
        </li>
      ))}
    </ul>
  );
}

/** 화면마다 카드 하나 — 번호 · 이름 · 주소, 아래에 기능 목록 */
function Screens({ items }: { items: [string, string, string[]][] }) {
  return (
    <div className="space-y-3">
      {items.map(([name, tag, feats], i) => (
        <Card key={name}>
          <div className="flex items-baseline gap-2">
            <span className="rounded-full bg-peach-soft px-2 py-0.5 text-[10px] font-extrabold tabular-nums text-peach">
              {i + 1}
            </span>
            <h2 className="text-sm font-extrabold">{name}</h2>
            {tag ? <span className="min-w-0 truncate text-[11px] font-semibold text-muted">{tag}</span> : null}
          </div>
          <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-ink/80">
            {feats.map((f) => (
              <li key={f} className="flex gap-2">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink/40" />
                <span className="min-w-0 [word-break:keep-all]">{f}</span>
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
