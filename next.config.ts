import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,

  images: {
    remotePatterns: [
      {
        // MinIO / S3 storage (CourseForge)
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      {
        // Local MinIO
        protocol: "http",
        hostname: "localhost",
        port: "9000",
      },
      {
        // Pexels stock images
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        // Pexels video thumbnails
        protocol: "https",
        hostname: "**.pexels.com",
      },
    ],
  },

  // Add CORS and security headers for cross-origin embedding
  async headers() {
    const courseforgeUrl = process.env.COURSEFORGE_FRONTEND_URL || "http://localhost:5173";

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: courseforgeUrl,
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
          // Allow iframe embedding from CourseForge
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors 'self' ${courseforgeUrl} http://localhost:5173 http://127.0.0.1:5173`,
          },
          // X-Frame-Options is deprecated but still used by some browsers
          {
            key: "X-Frame-Options",
            value: `ALLOW-FROM ${courseforgeUrl}`,
          },
        ],
      },
    ];
  },

  // Environment variables to expose to the browser
  env: {
    COURSEFORGE_API_URL: process.env.COURSEFORGE_API_URL || "http://localhost:8080",
  },
};

export default nextConfig;
