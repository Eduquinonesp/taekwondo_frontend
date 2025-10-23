import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 🚫 Evita que Render/Turbopack prerenderice /signup
  experimental: {
    turbo: {
      rules: {},
    },
  },
  async redirects() {
    return [];
  },
  // ✅ Desactiva el prerender de páginas específicas
  output: "standalone",
  // 👇 importante
  generateStaticParams: false,
  // 🚀 fuerza a que /signup sea dinámica (sin prerender)
  experimental: {
    dynamicIO: true,
  },
  // 👇 regla global para forzar render dinámico en /signup
  async headers() {
    return [
      {
        source: "/signup",
        headers: [
          {
            key: "x-nextjs-force-dynamic",
            value: "1",
          },
        ],
      },
    ];
  },
};

export default nextConfig;