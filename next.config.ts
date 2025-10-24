import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 移动端优先配置
  reactStrictMode: true,
  
  // 图片优化
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [375, 414, 768, 1024],
    imageSizes: [16, 32, 48, 64, 96],
  },

  // PWA配置
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  // 性能优化
  compress: true,
  poweredByHeader: false,

  // 移动端viewport
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ]
  },
}

export default nextConfig

