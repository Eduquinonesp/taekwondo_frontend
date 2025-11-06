// next.config.ts
const nextConfig = {
  experimental: {
    // Evita el warning de "boolean" en serverActions:
    serverActions: {},
  },
};

export default nextConfig;