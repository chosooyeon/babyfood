import type { Metadata } from "next";
import Link from "next/link";
import Screen from "@/components/Screen";
import { Article, Bullets, Clause, Contact, LegalFooter } from "@/components/Legal";
import { LEGAL } from "@/data/legal";
import { SITE_HOST, SITE_NAME } from "@/lib/site";
import { OBSERVE_DAYS } from "@/lib/types";
import { track } from "@/lib/track";

export const metadata: Metadata = {
  title: "이용약관",
  description: `${SITE_NAME} 이용약관. 무료로 제공되는 이유식 기록 도구이며 의학적 조언이 아닙니다. 수첩 코드 관리와 기록 백업은 보호자의 몫입니다.`,
  alternates: { canonical: "/terms" },
};

export const dynamic = "force-dynamic";

export default async function TermsPage() {
  await track("/terms");
  return (
    <Screen title="이용약관">
      <p className="-mt-2 mb-6 text-xs text-muted">
        시행일 {LEGAL.termsEffective} · {SITE_NAME} ({SITE_HOST})
      </p>
      <Article>
        <Clause title="1. 이 약관은">
          <p>
            {LEGAL.operator}(이하 “운영자”)가 제공하는 {SITE_NAME}(이하 “앱”)을 쓰는 데 필요한 약속입니다. 앱을 열어
            아기 정보를 저장하면 이 약관과{" "}
            <Link href="/privacy" className="font-semibold text-peach underline">
              개인정보처리방침
            </Link>
            에 동의한 것으로 봅니다.
          </p>
        </Clause>

        <Clause title="2. 앱이 하는 일">
          <Bullets
            items={[
              `아기 생년월일로 이유식 단계를 계산하고, 끼니와 재료를 기록하며, 처음 먹인 재료를 ${OBSERVE_DAYS}일 동안 관찰하도록 돕습니다.`,
              "재료별 시작 월령과 다음에 시도할 재료를 제안합니다.",
              "시판 이유식 브랜드의 체험팩 오픈 시각을 모아 보여주고, 캘린더 알림을 만들어 줍니다.",
              "회원가입 없이 기기마다 발급되는 수첩 코드로 기록을 나눕니다.",
            ]}
          />
        </Clause>

        <Clause title="3. 의학적 조언이 아닙니다 (중요)">
          <p>
            앱의 단계 기준, 재료 시작 월령, 관찰 기간, 추천은 식품의약품안전처·대한소아과학회의 공개 지침을 정리한
            <b className="text-ink"> 일반적인 참고 정보</b>이며, 개별 아기에 대한 진단·처방이 아닙니다. 알레르기 가족력이
            있거나, 이상반응이 나타났거나, 조산·질환 등 특별한 사정이 있으면 반드시 소아과 의사와 상의하세요.
            호흡 곤란, 얼굴·입술 부종, 반복 구토 같은 심한 증상은 앱에 기록하기 전에 119 또는 응급실로 가세요.
          </p>
        </Clause>

        <Clause title="4. 수첩 코드와 기록의 관리">
          <Bullets
            items={[
              "수첩 코드는 비밀번호 역할을 합니다. 코드를 아는 사람은 누구나 그 기록을 보고 고치고 지울 수 있습니다. 가족에게만 알려주세요.",
              "폰을 바꾸거나 브라우저 데이터를 지우면 새 수첩이 열립니다. 코드를 잃어버리면 기록을 찾아 드릴 수 없습니다.",
              "앱은 백업·내보내기 기능을 보장하지 않습니다. 병원에 보여줄 기록은 화면 캡처 등으로 따로 보관하세요.",
              "운영자는 보호자의 요청 없이 기록을 열어 보지 않습니다. 다만 장애 대응을 위해 데이터베이스에 접근할 수는 있습니다.",
            ]}
          />
        </Clause>

        <Clause title="5. 체험팩 정보">
          <p>
            체험팩 오픈 시각·월령·구성·비용은 각 브랜드 공식 홈페이지와 이용자 제보를 바탕으로 한 것이며, 예고 없이 바뀔 수
            있습니다. 앱은 브랜드와 아무 관계가 없고, 신청·결제·배송은 각 쇼핑몰의 약관을 따릅니다. 알림이 늦거나
            시각이 틀려 신청을 놓친 데 대해 운영자는 책임지지 않습니다.
          </p>
        </Clause>

        <Clause title="6. 무료 제공과 변경·중단">
          <p>
            앱은 무료이며 “있는 그대로” 제공됩니다. 운영자는 기능을 바꾸거나 더하거나, 사전 고지 후 서비스를 중단할 수
            있습니다. 무료 서비스의 성격상 데이터베이스가 일시 중지되거나 기록이 유실되어도 법이 허용하는 범위에서
            운영자는 손해를 배상할 책임을 지지 않습니다. 서비스를 끝낼 때는 최소 30일 전에 앱 안에 알립니다.
          </p>
        </Clause>

        <Clause title="7. 하지 말아야 할 것">
          <Bullets
            items={[
              "다른 사람의 수첩 코드를 추측하거나 무단으로 사용하는 행위",
              "자동화 도구로 반복 접속해 서비스를 느리게 하거나 데이터베이스 용량을 채우는 행위",
              "제보함에 광고·욕설·허위 정보를 보내는 행위",
              "앱의 콘텐츠(재료 사전, 소개 카드 등)를 출처 없이 상업적으로 다시 배포하는 행위",
            ]}
          />
          <p className="text-muted">위반 시 해당 수첩 코드의 접근을 막거나 기록을 삭제할 수 있습니다.</p>
        </Clause>

        <Clause title="8. 지식재산">
          <p>
            앱의 화면·문구·재료 사전·소개 카드의 저작권은 운영자에게 있습니다. 소개 카드 이미지는 앱을 알리는 목적으로
            자유롭게 공유할 수 있습니다. 보호자가 적은 기록의 권리는 보호자에게 있습니다.
          </p>
        </Clause>

        <Clause title="9. 준거법과 분쟁">
          <p>이 약관은 대한민국 법을 따릅니다. 분쟁이 생기면 먼저 운영자에게 알려 협의하고, 해결되지 않으면 민사소송법에 따른 법원에서 다룹니다.</p>
        </Clause>

        <Clause title="10. 약관의 변경">
          <p>약관이 바뀌면 이 페이지에 새 시행일과 함께 올립니다. 이용자에게 불리한 변경은 시행 7일 전에 올립니다. 변경 뒤에도 앱을 계속 쓰면 바뀐 약관에 동의한 것으로 봅니다.</p>
        </Clause>

        <Clause title="11. 문의">
          <Contact />
        </Clause>
      </Article>
      <LegalFooter here="terms" />
    </Screen>
  );
}
