import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Tắt thanh công cụ lập trình viên Next.js ở góc màn hình */
  devIndicators: false,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
