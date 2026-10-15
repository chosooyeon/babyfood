"use client";

import { useSyncExternalStore } from "react";

/**
 * 기기의 지금 시각 'HH:MM'. 서버에서는 null — 서버 시각을 그렸다가 바꾸면 hydration 이 어긋난다.
 * 구독자가 하나라도 있으면 30초마다 깨운다 (수유 시계 바늘, 분유 폼 기본 시각).
 */
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!timer) timer = setInterval(() => listeners.forEach((l) => l()), 30_000);
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

export function nowHHMM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function useNowHHMM(): string | null {
  return useSyncExternalStore(subscribe, nowHHMM, () => null);
}
