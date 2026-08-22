# 이유식 수첩 🍚

아이폰 홈 화면에 올려놓고 쓰는 개인용 이유식 기록 앱.
앱스토어·개발자 계정 없이 **PWA**로 배포한다.

## 왜 이 구조인가

| 결정 | 이유 |
|---|---|
| 앱이 아니라 **웹(PWA)** | 아이폰은 네이티브 배포에 개발자 계정($99/년)·Xcode가 필요하다. PWA 는 Safari → 공유 → **홈 화면에 추가** 하면 아이콘 + 전체화면으로 뜨고, push 하면 바로 반영된다 |
| **별도 저장소** | `automake-youtube/admin` 은 localhost 전용이고 증권 API 키가 붙어 있다. 폰에서 쓰려면 공개 배포해야 하는데 그러면 그게 같이 나간다 |
| DB 접근을 **서버에서만** | Supabase 키가 브라우저 번들에 실리면 URL 을 아는 사람이 아기 기록을 읽고 쓴다. `src/lib/db.ts` 는 `server-only` 라 클라이언트에서 import 하면 빌드가 깨진다 |
| 비밀번호 **1개** | 나 혼자 쓴다. 계정·이메일 인증은 과하다. 쿠키 1년이라 폰에서 한 번만 입력 |
| 3일 관찰을 **날짜에서 파생** | "3일 지났으니 안전"을 DB 에 쓰면 매일 돌 배치가 필요하고, 앱을 며칠 안 열면 상태가 썩는다. `derive.ts` 가 그때그때 계산한다 |

## 화면 4개

- **오늘** — D+일차·단계·오늘 끼니·관찰중 배너·다음 재료 추천
- **재료** — 도장깨기 그리드 (먹어봄 / 관찰중 / 이상반응 / 월령 미달)
- **기록** — 날짜별 타임라인 + 이상반응 재료 목록 (병원에서 보여줄 용도)
- **설정** — 아기 생년월일 (이거 하나로 나머지가 전부 계산됨)

## 처음 한 번 셋업

### 1. Supabase (5분, 무료)

1. https://supabase.com 에서 프로젝트 생성
2. 좌측 **SQL Editor** → `supabase/schema.sql` 내용 통째로 붙여넣고 Run
3. **Project Settings → API** 에서 두 값을 복사

### 2. 환경변수

```bash
cp .env.example .env.local
```

`.env.local` 을 채운다:

```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...   # anon 말고 service_role
APP_PASSWORD=원하는비밀번호
```

> `service_role` 키는 절대 클라이언트로 나가면 안 된다. 이 앱은 서버에서만 쓰고
> `.env.local` 은 git 에 안 올라간다.

### 3. 실행

```bash
npm install
npm run dev     # http://localhost:3100
```

## 배포 (Vercel, 무료)

```bash
gh repo create babyfood --private --source=. --push
```

1. https://vercel.com → Add New Project → 방금 만든 저장소 선택
2. **Environment Variables** 에 위 3개를 그대로 입력
3. Deploy

### 아이폰 홈 화면에 올리기

배포된 주소를 **Safari 로** 열고 (크롬 X) → 공유 버튼 → **홈 화면에 추가**.
주소창 없는 전체화면 앱으로 뜬다.

## 재료 기준을 내가 보는 책으로 바꾸기

`src/data/ingredients.ts` 의 기본값은 식약처·대한소아과학회 공개 지침이고
`source: "표준"` 으로 표시된다. 책이 다르면 값을 고치고 출처를 남긴다:

```ts
{ id: "broccoli", name: "브로콜리", startMonth: 7, source: "○○이유식 p.87" }
```

출처는 재료 상세 화면에 그대로 뜬다. 단계 기준(초기/중기/후기/완료기)은
`src/lib/stage.ts` 의 `STAGES` 에 있다.

아이콘을 바꾸려면 `scripts/make-icons.mjs` 의 SVG 를 고치고 `npm run icons`.

## 안 넣은 것 (일부러)

수면·수유·기저귀 기록, 사진 첨부, 통계 그래프, 공유. **매일 여는 앱은 화면이
하나여야 계속 쓰게 된다** — 필요해지면 그때 붙인다.
