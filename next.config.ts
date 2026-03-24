import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		// localhost resolves to 127.0.0.1; without this, next/image refuses to optimize those URLs (SSRF protection).
		dangerouslyAllowLocalIP:
			process.env.NODE_ENV === "development" ||
			process.env.ALLOW_LOCAL_IMAGES === "true",
		remotePatterns: [
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
			{
				protocol: "http",
				hostname: "localhost",
			},
			{
				protocol: "http",
				hostname: "localhost",
				port: "5000",
				pathname: "/uploads/**",
			},
		],
	},
};

export default nextConfig;
