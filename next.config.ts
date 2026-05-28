import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // 교육용: 모든 HTTPS 외부 이미지 허용
      },
    ],
  },
};

export default nextConfig;
