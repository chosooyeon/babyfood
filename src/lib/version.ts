import pkg from "../../package.json";

/** package.json 의 version — 설정 탭 바닥과 /admin 에 보인다. 올릴 때 CHANGELOG.md 도 같이 쓴다. */
export const APP_VERSION: string = pkg.version;
