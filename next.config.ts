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
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'commondatastorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'www.soundjay.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [375, 414, 768, 1024],
    imageSizes: [16, 32, 48, 64, 96],
    // 开发环境允许未优化的图片（避免跨域问题）
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // 实验性功能配置
  experimental: {
    // 包导入优化
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

