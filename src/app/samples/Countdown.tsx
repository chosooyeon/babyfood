"use client";

import { useEffect, useState } from "react";

/**
 * "3분 뒤" 같은 남은 시간. 서버가 그린 글자는 화면을 켜 둔 채로 두면 낡으므로,
 * 오픈 시각(epoch ms)을 받아 30초마다 다시 센다. 0이 되면 "지금 신청하세요".
 */
export default function Countdown({ openAt, fallback }: { openAt: number; fallback: string }) {
  const [label, setLabel] = useState(fallback);
  useEffect(() => {
    const tick = () => {
      const mins = Math.round((openAt - Date.now()) / 60_000);
      if (mins < 1) setLabel("지금 신청하세요");
      else if (mins < 60) setLabel(`${mins}분 뒤`);
      else if (mins < 12 * 60) setLabel(`${Math.floor(mins / 60)}시간 ${mins % 60 ? `${mins % 60}분 ` : ""}뒤`);
      else setLabel(fallback);
    };
    tick();
    const t = setInterval(tick, 30_000);
    return () => clearInterval(t);
  }, [openAt, fallback]);
  return <>{label}</>;
}
