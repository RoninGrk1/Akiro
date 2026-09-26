import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["solc", "sql.js"],
};

export default nextConfig;
