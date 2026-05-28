import { handlers } from "@/lib/auth";
// lib/auth.ts 즉, 실질적인 인증을 처리하는 NextAuth의 존재를 Next.js가 알수 있도록 re-export 하는 파일입니다. Next.js는 이 파일에서 GET, POST 핸들러를 자동으로 인식하여 /api/auth 경로에 인증 관련 API 엔드포인트를 생성합니다. 따라서 이 파일은 NextAuth 설정과 핸들러를 Next.js 라우팅 시스템에 연결하는 역할을 합니다.
export const { GET, POST } = handlers;
