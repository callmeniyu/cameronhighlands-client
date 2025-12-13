import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "images.unsplash.com",
                pathname: "/**",
            },
            {
                protocol: "http",
                hostname: "localhost",
                port: "3001",
                pathname: "/uploads/**",
            },
            {
                protocol: "http",
                hostname: "localhost",
                port: "3002",
                pathname: "/uploads/**",
            },
            {
                protocol: "http",
                hostname: "localhost",
                port: "3002",
                pathname: "/images/**",
            },
            {
                protocol: "https",
                hostname: "ui-avatars.com",
                pathname: "/**",
            },
            {
                protocol: "http",
                hostname: "192.168.43.50",
                port: "3002",
                pathname: "/uploads/**",
            },
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "example.com",
                pathname: "/**",
            },
        ],
        // Allow blob URLs for image previews
        dangerouslyAllowSVG: true,
        contentDispositionType: "attachment",
    },
    async redirects() {
        return [
            // Specific redirects for old routes
            
            // Tour page redirects (URL updates)
            // {
            //     source: "/tours/mossy-forest-highland-discovery",
            //     destination: "/tours/mossy-forest-full-day-highland-discovery",
            //     permanent: true,
            // },
        ];
    },
    /* config options here */
}

export default nextConfig
