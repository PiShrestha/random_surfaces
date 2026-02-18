/** @type {import('next').NextConfig} */
const nextConfig = {
  // During local dev, proxy /api/* to the Flask server on port 5328.
  // On Vercel, vercel.json rewrites handle this instead.
  async rewrites() {
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/api/:path*",
          destination: "http://localhost:5328/api/:path*",
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
