import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@fs/design-system", "@fs/cms-contracts"],
  images: { remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }] },
};

export default nextConfig;
