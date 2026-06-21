import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fixe la racine au dossier du projet : évite que Next ne choisisse un mauvais
  // « workspace root » quand un autre lockfile traîne ailleurs (ex. dossier home).
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
