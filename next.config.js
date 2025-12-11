// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com', 'profile.line-scdn.net']
  },
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  env: {
    MONGODB_URI: process.env.MONGODB_URI
  },
  reactStrictMode: false,

  // เพิ่ม CORS headers
  async headers() {
    return [
      {
        source: '/dashboard/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true'
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_ADMIN_AFF_URL || '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,POST,OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With,content-type,Authorization,API-KEY'
          }
        ]
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true'
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_ADMIN_AFF_URL || '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,POST,OPTIONS,PUT,DELETE'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With,content-type,Authorization,API-KEY'
          }
        ]
      }
    ]
  },

  // เพิ่ม rewrites ถ้าจำเป็น
  async rewrites() {
    return [
      {
        source: '/dashboard',
        destination: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
      }
    ]
  }
}

module.exports = nextConfig
