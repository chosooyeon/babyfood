# 이유식 수첩 🍚

아이폰 홈 화면에 올려놓고 쓰는 개인용 이유식 기록 앱.
앱스토어·개발자 계정 없이 **PWA**로 배포한다.

## 왜 이 구조인가

| 결정 | 이유 |
|---|---|
| 앱이 아니라 **웹(PWA)** | 아이폰은 네이티브 배포에 개발자 계정($99/년)·Xcode가 필요하다. PWA 는 Safari → 공유 → **홈 화면에 추가** 하면 아이콘 + 전체화면으로 뜨고, push 하면 바로 반영된다 |
| **별도 저장소** | `automake-youtube/admin` 은 localhost 전용이고 증권 API 키가 붙어 있다. 폰에서 쓰려면 공개 배포해야 하는데 그러면 그게 같이 나간다 |
| DB 접근을 **서버에서만** | Supabase 키가 브라우저 번들에 실리면 URL 을 아는 사람이 아기 기록을 읽고 쓴다. `src/lib/db.ts` 는 `server-only` 라 클라이언트에서 import 하면 빌드가 깨진다 |
| 로그인 대신 **수첩 코드** | 처음 온 기기마다 `src/proxy.ts` 가 무작위 12자리 코드를 httpOnly 쿠키로 심고, 모든 행이 그 코드(`household`)로 묶인다. 다른 기기에서 이어 쓰려면 설정 탭에 코드를 입력. 비밀번호·이메일 없이 집마다 기록이 갈라진다 |
| 3일 관찰을 **날짜에서 파생** | "3일 지났으니 안전"을 DB 에 쓰면 매일 돌 배치가 필요하고, 앱을 며칠 안 열면 상태가 썩는다. `derive.ts` 가 그때그때 계산한다 |

## 화면 4개

- **오늘** — D+일차·단계·오늘 끼니·관찰중 배너·다음 재료 추천
- **재료** — 도장깨기 그리드 (먹어봄 / 관찰중 / 이상반응 / 월령 미달)
- **기록** — 날짜별 타임라인 + 이상반응 재료 목록 (병원에서 보여줄 용도)
- **설정** — 아기 생년월일 (이거 하나로 나머지가 전부 계산됨) · 수첩 코드 보기·이어 쓰기

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
ADMIN_KEY=아무문자열                      # /admin 관리 화면 비밀키
CRON_SECRET=아무문자열                    # Vercel cron 이 /api/keepalive 를 부를 때 쓰는 키
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
2. **Environment Variables** 에 위 4개를 그대로 입력 (CRON_SECRET 이 없으면 프로덕션에서 keepalive 가 닫힌다)
3. Deploy

### 아이폰 홈 화면에 올리기

배포된 주소를 **Safari 로** 열고 (크롬 X) → 공유 버튼 → **홈 화면에 추가**.
주소창 없는 전체화면 앱으로 뜬다.

## 수첩 코드 (기기별 기록 분리)

앱은 로그인이 없지만 기록은 집마다 갈라진다. 처음 접속한 기기는 `src/proxy.ts` 에서
무작위 코드를 받고, `src/lib/household.ts` 의 `getHousehold()` 가 모든 쿼리·액션에 그 코드를
조건으로 건다. 설정 탭에 코드가 보이고, 다른 기기에서 같은 코드를 넣으면 같은 기록을 본다.

코드를 아는 사람은 누구나 그 집 기록을 보고 고칠 수 있다 — 가족에게만 알려준다.
폰을 바꾸거나 사이트 데이터를 지우면 새 수첩이 열리므로 코드를 메모해 두는 게 좋다.

이미 쓰던 DB 라면 `supabase/migrate-household.sql` 을 한 번 실행한다. 기존 행은 전부
그 파일 머리에 적힌 코드 한 집으로 묶이고, 설정 탭에 그 코드를 넣으면 되돌아온다.

## 관리 화면 (/admin)

`/admin` 은 `ADMIN_KEY` 로 잠겨 있고, 앱 하단 탭에는 안 나온다. 보여주는 것:

- Supabase 연결 상태·응답 시간, Vercel 리전·배포 커밋
- DB 용량 (무료 한도 500MB 대비), 테이블별 행 수·용량·마지막 기록
- 최근 14일 방문 수, 7일간 어떤 기기가 몇 번 썼는지, 서버 응답 속도(평균·p95)
- 최근 동작 30건

처음 한 번 Supabase **SQL Editor** 에서 `supabase/admin.sql` 을 실행해야 한다
(방문 기록 테이블 `visits` 와 통계 함수 `admin_stats()` 를 만든다). 방문 기록은
`src/lib/track.ts` 가 응답을 보낸 뒤 `after()` 로 남기므로 화면 속도에는 영향이 없고,
IP 는 해시 앞자리만 저장한다. 90일 지난 기록은 자동으로 지운다.

## Supabase 가 멈췄을 때

무료 플랜은 **1주일 동안 쿼리가 없으면 프로젝트가 일시중지**된다. 그러면 주소가
DNS 에서 사라져(NXDOMAIN) 앱은 "데이터베이스에 연결할 수 없어요" 화면을 띄운다.
supabase.com 대시보드 → 프로젝트 → **Restore project** 를 누르면 기록은 그대로 돌아온다.
**90일을 넘기면 복구 버튼이 사라지고 주소도 회수**되니, 그 전에 복구하자.
`vercel.json` 의 cron 이 매일 아침 6시(KST)에 `/api/keepalive` 를 한 번 열어 작은 쿼리를 보내므로,
배포만 돼 있으면 아무도 안 써도 멈추지 않는다. 혹시 멈췄다면 cron 이 꺼진 건지 Vercel → Settings → Cron Jobs 를 확인.

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
