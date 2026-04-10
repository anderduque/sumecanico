import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "sumecanico.shop" }],
        destination: "https://www.sumecanico.shop/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
