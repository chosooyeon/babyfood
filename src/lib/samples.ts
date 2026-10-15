import { SAMPLE_BRANDS, type OpenRule, type SampleBrand } from "@/data/samples";
import { SITE_URL } from "./site";

/**
 * 체험팩 오픈 시각 계산. 서버는 UTC 로 돌지만 시간표는 전부 한국 시각이라,
 * "지금"을 KST 로 옮겨 놓고 UTC getter 로 읽는다 (Date 에 시간대가 없어서 쓰는 요령).
 */
const KST_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 86_400_000;
const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

/** 한국 시각 기준의 "지금"을 UTC 필드에 담은 Date */
/** 체험팩 공식 홈으로 가는 중계 주소 (절대 주소 — 캘린더 앱은 상대 주소를 못 연다) */
export function goUrl(brand: SampleBrand, src: "samples" | "cal" = "cal"): string {
  return new URL(`/go/${brand.id}${src === "cal" ? "?src=cal" : ""}`, SITE_URL).toString();
}

export function nowKST(now = new Date()): Date {
  return new Date(now.getTime() + KST_MS);
}

export type Opening = {
  brand: SampleBrand;
  /** 다음 오픈 시각 (KST 필드를 UTC getter 로 읽는 Date) */
  at: Date;
  /** 같은 시각의 진짜 epoch ms — 클라이언트 카운트다운에 넘긴다 */
  epochMs: number;
  /** 지금부터 몇 분 뒤 */
  inMinutes: number;
  /** "오늘" | "내일" | "금요일" */
  dayLabel: string;
  /** "00:00" */
  time: string;
};

const hm = (t: string) => t.split(":").map(Number) as [number, number];

/** 규칙의 다음 오픈 시각. 상시는 null. */
export function nextOpening(rule: OpenRule, kstNow: Date): Date | null {
  if (rule.kind === "always") return null;
  const [h, m] = hm(rule.time);
  const base = new Date(
    Date.UTC(
      kstNow.getUTCFullYear(),
      kstNow.getUTCMonth(),
      kstNow.getUTCDate(),
      h,
      m,
    ),
  );
  for (let i = 0; i < 8; i++) {
    const cand = new Date(base.getTime() + i * DAY_MS);
    if (cand.getTime() < kstNow.getTime()) continue;
    const wd = cand.getUTCDay();
    if (rule.kind === "daily" && rule.weekdaysOnly && (wd === 0 || wd === 6))
      continue;
    if (rule.kind === "weekly" && wd !== rule.weekday) continue;
    return cand;
  }
  return null;
}

function dayLabel(at: Date, kstNow: Date): string {
  const d0 = Math.floor(kstNow.getTime() / DAY_MS);
  const d1 = Math.floor(at.getTime() / DAY_MS);
  if (d1 === d0) return "오늘";
  if (d1 === d0 + 1) return "내일";
  return `${WEEK[at.getUTCDay()]}요일`;
}

/** 시간이 정해진 브랜드를 다음 오픈 순으로 */
export function upcomingOpenings(now = new Date()): Opening[] {
  const kst = nowKST(now);
  const list: Opening[] = [];
  for (const brand of SAMPLE_BRANDS) {
    const at = nextOpening(brand.rule, kst);
    if (!at) continue;
    list.push({
      brand,
      at,
      epochMs: at.getTime() - KST_MS,
      inMinutes: Math.round((at.getTime() - kst.getTime()) / 60_000),
      dayLabel: dayLabel(at, kst),
      time: brand.rule.kind === "always" ? "" : brand.rule.time,
    });
  }
  return list.sort((a, b) => a.at.getTime() - b.at.getTime());
}

/** "자정" "오전 9시" "오후 8시 10분" — 폰 화면에서 숫자보다 빨리 읽힌다 */
export function timeLabel(time: string): string {
  const [h, m] = hm(time);
  if (h === 0 && m === 0) return "자정";
  const ampm = h < 12 ? "오전" : "오후";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return m ? `${ampm} ${hh}시 ${m}분` : `${ampm} ${hh}시`;
}

/** 규칙을 한 줄로: "매일 자정 · 90명" "평일 오후 8시 10분" "매주 금요일 오전 10시" */
export function ruleLabel(brand: SampleBrand): string {
  const r = brand.rule;
  const limit = brand.limit ? ` · 선착순 ${brand.limit}명` : "";
  if (r.kind === "always") return brand.note ?? "상시";
  if (r.kind === "daily")
    return `${r.weekdaysOnly ? "평일" : "매일"} ${timeLabel(r.time)}${limit}`;
  return `매주 ${WEEK[r.weekday]}요일 ${timeLabel(r.time)}${limit}`;
}

/** "3분 뒤" "2시간 뒤" "내일 자정" */
export function untilLabel(o: Opening): string {
  if (o.inMinutes < 1) return "지금";
  if (o.inMinutes < 60) return `${o.inMinutes}분 뒤`;
  if (o.inMinutes < 12 * 60) return `${Math.floor(o.inMinutes / 60)}시간 뒤`;
  return `${o.dayLabel} ${timeLabel(o.time)}`;
}

// ── 캘린더(.ics) ────────────────────────────────────────────
// 아이폰 캘린더가 그대로 받는 반복 일정. 오픈 N분 전 알림을 붙인다 (기본 10분).
// 자동 신청은 각 쇼핑몰 로그인·봇 방지 때문에 못 하고 해서도 안 되니, 알림이 현실적인 최선.

const BYDAY = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const pad = (n: number) => String(n).padStart(2, "0");

function icsEscape(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/** 알림을 몇 분 전에 울릴지 — 화면의 선택지와 route 의 허용값이 같아야 한다 */
export const ALARM_CHOICES = [5, 10, 15, 30, 60] as const;
export const DEFAULT_ALARM = 10;

export type CalendarOptions = {
  /** 오픈 몇 분 전에 알릴지 */
  before?: number;
  /** 넣을 브랜드 id. 비우면 시간이 정해진 브랜드 전부 */
  brandIds?: string[];
};

export function buildCalendar(
  now = new Date(),
  opts: CalendarOptions = {},
): string {
  const before = opts.before ?? DEFAULT_ALARM;
  const only = opts.brandIds?.length ? new Set(opts.brandIds) : null;
  const kst = nowKST(now);
  const stamp = `${kst.getUTCFullYear()}${pad(kst.getUTCMonth() + 1)}${pad(kst.getUTCDate())}T${pad(kst.getUTCHours())}${pad(kst.getUTCMinutes())}00`;
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//babyfood//samples//KO",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:이유식 체험팩 오픈",
    "X-WR-TIMEZONE:Asia/Seoul",
    "BEGIN:VTIMEZONE",
    "TZID:Asia/Seoul",
    "BEGIN:STANDARD",
    "DTSTART:19700101T000000",
    "TZOFFSETFROM:+0900",
    "TZOFFSETTO:+0900",
    "TZNAME:KST",
    "END:STANDARD",
    "END:VTIMEZONE",
  ];
  for (const brand of SAMPLE_BRANDS) {
    const r = brand.rule;
    if (r.kind === "always") continue;
    if (only && !only.has(brand.id)) continue;
    const first = nextOpening(r, kst);
    if (!first) continue;
    const dt = `${first.getUTCFullYear()}${pad(first.getUTCMonth() + 1)}${pad(first.getUTCDate())}T${pad(first.getUTCHours())}${pad(first.getUTCMinutes())}00`;
    const rrule =
      r.kind === "weekly"
        ? `FREQ=WEEKLY;BYDAY=${BYDAY[r.weekday]}`
        : r.weekdaysOnly
          ? "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR"
          : "FREQ=DAILY";
    lines.push(
      "BEGIN:VEVENT",
      `UID:samples-${brand.id}@babyfood`,
      `DTSTAMP:${stamp}Z`,
      `DTSTART;TZID=Asia/Seoul:${dt}`,
      "DURATION:PT15M",
      `RRULE:${rrule}`,
      `SUMMARY:${icsEscape(`${brand.emoji} ${brand.name} 체험팩 오픈${brand.limit ? ` (${brand.limit}명)` : ""}`)}`,
      // 공식 홈 대신 /go 중계 주소 — 알림에서 눌러 들어간 클릭도 집계된다 (src=cal)
      `DESCRIPTION:${icsEscape(`${ruleLabel(brand)}\n${goUrl(brand)}`)}`,
      `URL:${goUrl(brand)}`,
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${icsEscape(`${brand.name} 체험팩 ${before}분 뒤 오픈`)}`,
      `TRIGGER:-PT${before}M`,
      "END:VALARM",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}
