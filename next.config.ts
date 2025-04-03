import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone', // Si estás desplegando a una plataforma como Render, puede ser útil usar este ajuste.
};

export default nextConfig;
