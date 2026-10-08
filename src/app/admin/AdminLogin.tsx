"use client";

import { useActionState } from "react";
import { Lock } from "lucide-react";
import { adminLogin } from "./actions";
import SubmitButton from "@/components/SubmitButton";

export default function AdminLogin() {
  const [error, action] = useActionState(adminLogin, null);
  return (
    <form action={action} className="mt-10 rounded-blob border border-line bg-card p-6 text-center">
      <Lock size={28} className="mx-auto text-muted" />
      <h1 className="mt-3 text-lg font-extrabold">관리 화면</h1>
      <p className="mt-1 text-xs text-muted">ADMIN_KEY 를 입력하세요</p>
      <input
        name="key"
        type="password"
        autoComplete="off"
        placeholder="관리 키"
        className="mt-5 w-full rounded-2xl border border-line bg-cream px-5 py-3.5 text-center text-base outline-none focus:border-peach"
      />
      {error ? <p className="mt-3 text-sm font-semibold text-berry">{error}</p> : null}
      <SubmitButton
        pendingLabel="확인 중…"
        className="mt-3 w-full rounded-2xl bg-ink py-3.5 font-bold text-white active:scale-[.98]"
      >
        들어가기
      </SubmitButton>
    </form>
  );
}
