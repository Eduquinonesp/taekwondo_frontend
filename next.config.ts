/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // ⚠️ elimina cualquier valor no soportado como dynamicIO o cacheComponents
    serverActions: true,
  },
  // ✅ evita el prerender en rutas dinámicas
  output: "standalone",
};

module.exports = nextConfig;