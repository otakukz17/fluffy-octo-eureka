/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    // Prevent Webpack from watching SQLite database files in dev
    if (dev) {
      config.watchOptions = config.watchOptions || {}
      const ignored = config.watchOptions.ignored ?? []
      config.watchOptions.ignored = Array.isArray(ignored)
        ? [...ignored, '**/var/**', '**/*.sqlite', '**/*.sqlite-wal', '**/*.sqlite-shm']
        : ['**/var/**', '**/*.sqlite', '**/*.sqlite-wal', '**/*.sqlite-shm']
    }
    // Polyfill node built-ins used by browser libs
    config.resolve = config.resolve || {}
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      fs: false,
      path: false,
    }
    return config
  },
}

module.exports = nextConfig
