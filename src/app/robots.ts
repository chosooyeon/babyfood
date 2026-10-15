import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * 검색엔진에게 어디를 긁어도 되는지. 관리 화면·API·저장용 포스터는 막고,
 * 한 집의 기록만 보이는 기록·설정 탭은 페이지 쪽 metadata.robots 로 noindex 를 건다.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/guide/card/", "/guide/og"] },
    sitemap: new URL("/sitemap.xml", SITE_URL).toString(),
  };
}
