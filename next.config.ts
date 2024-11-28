import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '.*',  
        port: '',
        pathname: '/**',  
      },
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
        port: '',
        pathname: '/**',  
      },
      {
        protocol: 'https',
        hostname: 'www.biotecdermo.com.br',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.designi.com.br',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'st2.depositphotos.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.findup.com.br',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
