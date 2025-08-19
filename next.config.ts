const nextConfig = {
  experimental: {
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: "/:shortCode([a-zA-Z0-9_-]+)",
        destination: "/api/redirect/:shortCode",
        has: [
          {
            type: "host",
            value: "(?<domain>.*)",
          },
        ],
      },
    ]
  },
  ...process.env.USEDOCKER === 'true' ? {
    outputFileTracingRoot: '/app',
    output: 'standalone',
  } : {},
  images: {
    unoptimized: true,
  },
}

export default nextConfig
