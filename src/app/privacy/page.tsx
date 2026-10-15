import type { Metadata } from "next";
import Link from "next/link";
import Screen from "@/components/Screen";
import { Article, Bullets, Clause, Contact, LegalFooter, Table } from "@/components/Legal";
import { LEGAL } from "@/data/legal";
import { SITE_HOST, SITE_NAME } from "@/lib/site";
import { HH_COOKIE } from "@/lib/household-code";
import { TIPS_PER_DAY } from "@/data/samples";
import { track } from "@/lib/track";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: `${SITE_NAME}이 어떤 정보를 받아 어디에 어떻게 보관하고, 언제 지우는지. 이메일·전화번호 없이 수첩 코드로만 기록을 나눕니다.`,
  alternates: { canonical: "/privacy" },
};

export const dynamic = "force-dynamic";

/**
 * 개인정보보호법 제30조가 요구하는 항목 순서대로 쓴다.
 * 수집 항목·보관 기간은 코드(schema.sql, track.ts, proxy.ts)와 맞춰야 하고, 바꾸면 LEGAL.privacyEffective 도 올린다.
 */
export default async function PrivacyPage() {
  await track("/privacy");
  const cookieDays = 400;
  return (
    <Screen title="개인정보처리방침">
      <p className="-mt-2 mb-6 text-xs text-muted">
        시행일 {LEGAL.privacyEffective} · {SITE_NAME} ({SITE_HOST})
      </p>
      <Article>
        <p>
          {SITE_NAME}(이하 “앱”)은 아기 이유식 기록을 돕는 무료 웹앱입니다. 회원가입·로그인이 없고,
          이메일·전화번호·실명을 받지 않습니다. 이 문서는 앱이 어떤 정보를 어디에 보관하고 언제 지우는지,
          그리고 보호자가 그 정보를 어떻게 지울 수 있는지를 적은 것입니다.
        </p>

        <Clause title="1. 처리하는 개인정보 항목과 목적">
          <p>보호자가 직접 적는 정보</p>
          <Table
            head={["항목", "목적", "보관 기간"]}
            rows={[
              ["아기 이름(별명도 괜찮아요), 생년월일", "D+일차·개월수·이유식 단계·재료 시작 월령 계산", "보호자가 지울 때까지"],
              ["끼니 기록(메뉴, 재료, 먹인 시각, 먹은 양, 반응, 메모)", "오늘 먹은 것·수유 시계·기록 타임라인·달력 표시", "보호자가 지울 때까지"],
              ["분유 기록(먹인 시각, 양)", "수유 시계와 오늘 먹은 것 표시", "보호자가 지울 때까지"],
              ["재료 도입일, 관찰 상태, 이상반응 증상·메모", "3일 알레르기 관찰과 재료 추천", "보호자가 지울 때까지"],
              ["체험팩 ‘신청했어요’ 체크", "신청한 브랜드를 아래로 내리기", "보호자가 지울 때까지"],
              ["문의·제보(주제, 내용, 링크)", "시간표·재료 기준 확인과 오류 수정", "보호자가 지울 때까지"],
            ]}
          />
          <p className="pt-2">앱을 열면 자동으로 남는 정보</p>
          <Table
            head={["항목", "목적", "보관 기간"]}
            rows={[
              [
                <>
                  수첩 코드 쿠키 <code className="rounded bg-sand px-1">{HH_COOKIE}</code> (무작위 12자리)
                </>,
                "로그인 대신 ‘어느 집 기록인지’ 구분",
                `기기에 ${cookieDays}일, 또는 브라우저 데이터를 지울 때까지`,
              ],
              [
                "방문 기록: 연 화면 주소, 기기·브라우저 종류(예: iPhone · Safari), 브라우저 식별 문자열 앞 200자, IP 주소의 해시 앞 12자리, 서버 응답 시간",
                "체험팩 링크 클릭 기록: 누른 브랜드, 누른 곳(화면·캘린더 알림), 수첩 코드, 기기·브라우저 종류, IP 주소의 해시 앞 12자리",
                "장애 확인과 사용량 파악 (운영자만 봄)",
                "90일 뒤 자동 삭제",
              ],
            ]}
          />
          <p className="text-muted">
            IP 주소는 그대로 저장하지 않습니다. 비밀값을 섞어 한 번 해시한 앞자리만 남기므로 “같은 기기인지”는
            보이지만 누구인지는 운영자도 알 수 없습니다. 검색엔진·크롤러의 방문은 기록하지 않습니다.
          </p>
        </Clause>

        <Clause title="2. 받지 않는 것">
          <Bullets
            items={[
              "이메일, 전화번호, 실명, 주소, 결제 정보, 위치 정보, 광고 식별자",
              "제3자 분석 도구(구글 애널리틱스 등)·광고 스크립트를 넣지 않습니다",
              "사진·연락처 등 기기 권한을 요청하지 않습니다",
            ]}
          />
        </Clause>

        <Clause title="3. 아동의 개인정보">
          <p>
            아기 이름과 생년월일은 만 14세 미만 아동의 정보이며, 법정대리인(보호자)이 직접 입력하는 것으로 봅니다.
            보호자가 입력하는 행위를 그 아동 정보 처리에 대한 법정대리인의 동의로 봅니다. 이름 대신 별명을 써도
            앱은 똑같이 동작합니다.
          </p>
        </Clause>

        <Clause title="4. 보관 장소와 처리 위탁·국외 이전">
          <p>앱은 서버를 직접 두지 않고 아래 서비스에 보관·실행을 맡깁니다.</p>
          <Table
            head={["받는 곳", "맡기는 일", "항목", "위치"]}
            rows={[
              ["Supabase, Inc.", "데이터베이스 보관", "1항의 모든 정보", `${LEGAL.dbRegion} 리전 (클라우드)`],
              ["Vercel Inc.", "웹 서버 실행·배포", "요청 처리 중 일시 전달(접속 IP 포함)", "미국 등 Vercel 의 엣지 네트워크"],
            ]}
          />
          <p>
            글꼴(Pretendard)은 jsDelivr CDN 에서 보호자의 브라우저가 직접 받아 오며, 그 과정에서 접속 IP 가 CDN 에
            전달됩니다. 앱은 CDN 에 다른 정보를 보내지 않습니다. 보관 중인 정보는 서비스 제공과 운영 외의 목적으로
            제3자에게 제공하거나 판매하지 않습니다.
          </p>
        </Clause>

        <Clause title="5. 보호자의 권리와 행사 방법">
          <Bullets
            items={[
              "열람·정정: 앱 안에서 언제든 직접 보고 고칠 수 있습니다 (설정 탭에서 아기 정보, 각 화면에서 기록).",
              <>
                삭제: 설정 탭 맨 아래 <b className="text-ink">‘이 수첩 기록 모두 지우기’</b>를 누르면 그 수첩 코드에
                묶인 아기·끼니·분유·재료·체험팩 체크·제보가 즉시 지워지고 새 코드가 발급됩니다. 되돌릴 수 없습니다.
              </>,
              "같은 코드를 넣은 다른 기기(가족 폰)에서도 같은 기록이 보이고 지워집니다. 코드를 아는 사람은 누구나 그 기록을 보고 고칠 수 있으니 가족에게만 알려주세요.",
              "수첩 코드를 잃어버리면 운영자도 어느 코드가 누구 것인지 알 수 없어 기록을 찾아 드릴 수 없습니다. 코드를 메모해 두세요.",
              "방문 기록은 특정인을 가려낼 수 없어 개별 삭제 요청 대상이 아니며, 90일이 지나면 자동으로 지워집니다.",
            ]}
          />
        </Clause>

        <Clause title="6. 파기 절차">
          <p>
            보호자가 ‘모두 지우기’를 누르면 데이터베이스에서 바로 삭제됩니다. 방문 기록은 운영 화면을 열 때마다
            90일 지난 행을 삭제합니다. 데이터베이스 사업자가 백업을 두는 경우 그 백업은 사업자 정책에 따른 기간이 지나면 사라집니다.
          </p>
        </Clause>

        <Clause title="7. 안전성 확보 조치">
          <Bullets
            items={[
              "모든 통신은 HTTPS 로 암호화됩니다.",
              "데이터베이스 키는 서버에만 있고 브라우저로 내려가지 않습니다. 데이터베이스는 행 수준 보안(RLS)을 켜 두어 서버 외에는 아무도 읽을 수 없습니다.",
              "수첩 코드 쿠키는 httpOnly·secure 로 심어 스크립트가 읽지 못합니다.",
              "모든 조회·수정은 요청한 기기의 수첩 코드로만 거릅니다. 다른 집 기록은 쿼리에 아예 걸리지 않습니다.",
              `제보는 집마다 하루 ${TIPS_PER_DAY}건까지만 받습니다.`,
            ]}
          />
        </Clause>

        <Clause title="8. 쿠키에 대하여">
          <p>
            앱이 심는 쿠키는 수첩 코드 하나뿐이며 로그인 대신 쓰입니다. 브라우저 설정에서 쿠키를 막으면 기록이 저장되지
            않습니다. 추적·광고용 쿠키는 없습니다.
          </p>
        </Clause>

        <Clause title="9. 개인정보 보호책임자">
          <Contact />
          <p className="text-muted">
            개인정보 침해에 대한 신고·상담은 개인정보침해신고센터(privacy.kisa.or.kr, 118), 개인정보분쟁조정위원회(kopico.go.kr,
            1833-6972)에서도 받습니다.
          </p>
        </Clause>

        <Clause title="10. 이 방침의 변경">
          <p>
            내용이 바뀌면 이 페이지에 새 시행일과 함께 올리고,{" "}
            <Link href="/settings" className="underline">
              설정 탭
            </Link>
            의 버전 기록(CHANGELOG)에 남깁니다. 수집 항목이 늘어나는 변경은 시행 7일 전에 올립니다.
          </p>
        </Clause>
      </Article>
      <LegalFooter here="privacy" />
    </Screen>
  );
}
