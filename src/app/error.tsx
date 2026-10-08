"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";
import Screen from "@/components/Screen";
import { Card } from "@/components/ui";

/**
 * 화면 렌더링 중 던져진 에러를 받는다. 이 앱에서 던지는 건 사실상 DB 연결 실패 하나다.
 * 프로덕션에서는 보안상 서버 에러 메시지가 클라이언트로 오지 않으므로
 * 원인 문구는 /admin 이 서버에서 그려서 보여준다.
 */
export default function Error({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <Screen>
      <Card className="mt-10 text-center">
        <div className="text-4xl">🔌</div>
        <h1 className="mt-3 text-lg font-extrabold">데이터베이스에 연결할 수 없어요</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Supabase 무료 플랜은 1주일 동안 안 쓰면 프로젝트가 일시중지돼요. Supabase
          대시보드에서 <b className="text-ink">Restore</b> 를 누르면 기록은 그대로 돌아와요.
        </p>
        <button
          onClick={() => retry()}
          className="mt-5 inline-flex items-center gap-1.5 rounded-2xl bg-peach px-6 py-3 font-bold text-white active:scale-[.98]"
        >
          <RefreshCw size={16} /> 다시 시도
        </button>
        <p className="mt-4 text-[11px] text-muted">
          자세한 원인은{" "}
          <Link href="/admin" className="underline underline-offset-2">
            관리 화면
          </Link>
          에서 볼 수 있어요.
        </p>
      </Card>
    </Screen>
  );
}
