import "server-only";
import { cookies, headers } from "next/headers";
import { HH_COOKIE, HH_HEADER, isHouseholdCode } from "./household-code";

/**
 * 지금 요청이 어느 집 것인지. 모든 쿼리·액션은 이 값으로 행을 거른다.
 *
 * 쿠키가 우선이고, 쿠키를 막 심은 첫 요청만 proxy 가 넣어 준 헤더로 받는다.
 * 쿠키가 있을 때 헤더는 proxy 가 지우므로 클라이언트가 헤더로 남의 집을 고를 수 없다.
 */
export async function getHousehold(): Promise<string> {
  const fromCookie = (await cookies()).get(HH_COOKIE)?.value;
  if (isHouseholdCode(fromCookie)) return fromCookie;
  const fromHeader = (await headers()).get(HH_HEADER);
  if (isHouseholdCode(fromHeader)) return fromHeader;
  throw new Error("수첩 코드 쿠키가 없어요. 브라우저 쿠키를 허용해 주세요.");
}
