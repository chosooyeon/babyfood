import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { SAMPLES_INFO_CHECKED } from "@/data/samples";
import { LEGAL } from "@/data/legal";

/** 검색엔진에 알려줄 공개 화면 목록. 한 집의 기록만 보이는 기록·설정 탭은 넣지 않는다. */
export default function sitemap(): MetadataRoute.Sitemap {
  const at = (path: string) => new URL(path, SITE_URL).toString();
  return [
    { url: at("/"), changeFrequency: "monthly", priority: 1 },
    { url: at("/guide"), changeFrequency: "monthly", priority: 0.9 },
    { url: at("/samples"), lastModified: SAMPLES_INFO_CHECKED, changeFrequency: "weekly", priority: 0.9 },
    { url: at("/ingredients"), changeFrequency: "monthly", priority: 0.7 },
    { url: at("/privacy"), lastModified: LEGAL.privacyEffective, changeFrequency: "yearly", priority: 0.2 },
    { url: at("/terms"), lastModified: LEGAL.termsEffective, changeFrequency: "yearly", priority: 0.2 },
  ];
}
