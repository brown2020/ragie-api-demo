/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.stripe.com https://*.stripe.network",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://firebasestorage.googleapis.com https://lh3.googleusercontent.com",
  "font-src 'self' data:",
  [
    "connect-src 'self'",
    "https://*.googleapis.com",
    "https://*.firebaseio.com",
    "https://*.firebaseapp.com",
    "https://firebasestorage.googleapis.com",
    "https://api.stripe.com",
    "https://*.stripe.com",
    "https://*.stripe.network",
    "https://api.ragie.ai",
    "wss://*.firebaseio.com",
    "wss://*.googleapis.com",
    isProd ? "" : "ws://localhost:* http://localhost:* ws://127.0.0.1:* http://127.0.0.1:*",
  ]
    .filter(Boolean)
    .join(" "),
  "frame-src https://js.stripe.com https://hooks.stripe.com https://*.stripe.com https://*.stripe.network https://accounts.google.com https://apis.google.com https://*.firebaseapp.com",
  "worker-src 'self' blob:",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains",
        },
      ]
    : []),
];

const nextConfig = {
  reactStrictMode: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
