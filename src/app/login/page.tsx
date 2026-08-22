"use client";

import { useActionState } from "react";
import Image from "next/image";
import { login } from "../actions";

export default function LoginPage() {
  const [error, action, pending] = useActionState(login, null);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-8">
      <Image src="/icons/icon.svg" alt="" width={96} height={96} className="mb-5 rounded-blob" priority />
      <h1 className="text-2xl font-extrabold">이유식 수첩</h1>
      <p className="mt-1 text-sm text-muted">우리 집 전용이에요</p>

      <form action={action} className="mt-8 w-full">
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="비밀번호"
          className="w-full rounded-2xl border border-line bg-card px-5 py-4 text-center text-base outline-none focus:border-peach"
        />
        {error ? <p className="mt-3 text-center text-sm font-semibold text-berry">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="mt-4 w-full rounded-2xl bg-peach py-4 text-base font-bold text-white active:scale-[.98] disabled:opacity-50"
        >
          {pending ? "확인 중…" : "들어가기"}
        </button>
      </form>
    </main>
  );
}
