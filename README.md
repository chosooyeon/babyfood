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

## 화면

오늘 · 먹인 것 · 기록 · 체험팩 · 설정 다섯 탭. 재료 도장깨기는 오늘 탭의 진행률 카드에서 들어간다.
각 화면이 뭘 하는지는 **/admin/spec 기획서**(코드에서 읽어 와 항상 최신)와 **/guide 소개 카드**에 있다.
여기엔 적지 않는다 — 세 군데 따로 고치다 보면 어긋난다.

## 처음 한 번 셋업

### 1. Supabase (5분, 무료)

1. https://supabase.com 에서 프로젝트 생성
2. 좌측 **SQL Editor** → `supabase/schema.sql` 내용 통째로 붙여넣고 Run
   (테이블이 늘어난 버전으로 올릴 때도 이 파일을 다시 돌리면 된다. 전부 `if not exists`)
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

## 버전 올릴 때 DB

테이블·열이 늘어난 버전(1.1.0 체험팩, 1.3.0 분유·먹인 시각·체험팩 클릭)으로 올리면 Supabase SQL Editor 에서
`supabase/schema.sql` 과 `supabase/admin.sql` 을 한 번씩 더 돌린다. 둘 다 `if not exists` / `create or replace` 라
몇 번을 돌려도 안전하고, 기존 기록은 그대로다. 안 돌리면 분유 기록이 "저장하지 못했어요"가 되고 /admin 표에 테이블이 빠진다.

## 검색엔진·공유 (SEO)

주소·이름·설명은 `src/lib/site.ts` 한 곳에서 읽는다. 생기는 것:

| 무엇 | 어디서 |
|---|---|
| `robots.txt` · `sitemap.xml` | `src/app/robots.ts`, `src/app/sitemap.ts` — 공개 화면만 넣고 관리·API·포스터는 막는다 |
| 화면별 제목·설명·canonical | 각 `page.tsx` 의 `metadata`. 기록·설정·관리는 noindex |
| 공유 미리보기 그림 `public/og.png` | `npm run build && npm run cards` (`/guide/og` 를 Chrome 으로 찍는다) |
| 구조화 데이터 (schema.org WebApplication) | `src/app/layout.tsx` |

서치콘솔에 등록하려면 Vercel 환경변수에 `GOOGLE_SITE_VERIFICATION`(구글 HTML 태그의 content 값),
`NAVER_SITE_VERIFICATION`(네이버 메타태그의 content 값)을 넣고 다시 배포한다. 코드는 안 고쳐도 된다.
등록 뒤 사이트맵 주소 `/sitemap.xml` 을 제출한다. 도메인을 바꾸면 `NEXT_PUBLIC_SITE_URL` 하나만 바꾼다.

## 개인정보처리방침·이용약관

`/privacy`, `/terms`. 글은 그 두 `page.tsx` 에 있고, 운영자 이름·연락처·DB 리전·시행일은
`src/data/legal.ts` 에 있다. **배포 전에 운영자와 연락처를 채운다** (개인정보보호법상 보호책임자 표기).
수집 항목이나 보관 기간을 바꾸는 코드 변경(track.ts, schema.sql, proxy.ts)을 하면 처리방침 1항과
시행일도 같이 고친다. 삭제권은 설정 탭 '이 수첩 기록 모두 지우기' 로 실제로 동작한다.

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
- 체험팩 링크 클릭 — 브랜드별 전체·7일·누른 집 수·캘린더 알림 경유. `/samples` 의 "사이트 열기"와 알림 링크가
  `/go/{brand}` 를 거치며 `sample_clicks` 에 한 줄 남기고 공식 홈으로 302. 업체 제안서용 숫자라 지우지 않는다
- 최근 동작 30건
- **내 기기 제외** — 관리 키로 들어온 기기에 `bf_me` 쿠키(경로 /)가 심어져, 그 기기의 방문·클릭은 `mine=true` 로
  저장되고 모든 집계에서 빠진다(목록엔 "나" 표시). 폰도 /admin 에 한 번 들어오면 된다. 현황 화면에서 끄고 켤 수 있고,
  로컬 `npm run dev`·Vercel 프리뷰(`VERCEL_ENV !== "production"`)는 항상 "나"다
- 탭: 현황 · 기획서(/admin/spec) · 제보(/admin/tips, 체험팩 시간표 제보함)

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

## 버전 올리기

1. `package.json` 의 `version` 을 올린다 (규칙은 CHANGELOG.md 머리에).
2. `CHANGELOG.md` 맨 위에 새 항목을 쓴다 — 무엇이 왜 바뀌었는지, SQL 을 다시 돌려야 하는지.
3. 커밋하고 같은 번호로 태그를 단다: `git tag v1.1.0 && git push --tags`

설정 탭 바닥과 /admin 에 돌아가는 버전이 보이므로, 폰에 새 버전이 깔렸는지 거기서 확인한다.

## 안 넣은 것 (일부러)

수면·수유·기저귀 기록, 사진 첨부, 통계 그래프, 공유. **매일 여는 앱은 화면이
하나여야 계속 쓰게 된다** — 필요해지면 그때 붙인다.
