const nextConfig = {
  // Enable experimental features for better multi-domain support
  experimental: {
    // Future experimental features can be added here
  },
  
  // Configure headers for better CORS and security
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

  // Configure rewrites for better domain handling
  async rewrites() {
    return [
      // Handle shortcode redirects for all domains
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

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
