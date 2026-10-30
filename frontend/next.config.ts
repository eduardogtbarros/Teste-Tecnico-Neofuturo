import type { NextConfig } from "next";
import { config } from "dotenv";
import { resolve } from "path";

config({
  path: resolve(process.cwd(), "../.env")
});

const nextConfig: NextConfig = {
  /* config options here */
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
