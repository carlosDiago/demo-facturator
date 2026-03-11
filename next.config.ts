import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS || false;
let assetPrefix = '';
let basePath = '';

if (isGithubActions) {
  const repo = process.env.GITHUB_REPOSITORY?.replace(/.*?\//, '') || 'demo-facturator';
  assetPrefix = `/${repo}/`;
  basePath = `/${repo}`;
}

const nextConfig: NextConfig = {
  output: "export",
  assetPrefix: assetPrefix,
  basePath: basePath,
  images: {
    unoptimized: true, // Necessary for static export with Next.js Image component
  },
};

export default nextConfig;
