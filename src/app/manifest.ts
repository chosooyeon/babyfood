import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "이유식 수첩",
    short_name: "이유식",
    description: "오늘 먹인 것과 새 재료 알레르기 관찰을 한 화면에서",
    start_url: "/",
    // 홈 화면에서 열면 사파리 주소창 없이 앱처럼 뜬다
    display: "standalone",
    background_color: "#FFFCF7",
    theme_color: "#FFE3D3",
    orientation: "portrait",
    lang: "ko",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
