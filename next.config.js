// next.config.js
const buildConfig = require('./next.config.build');

const defaultConfig = {
    reactStrictMode: true,
    swcMinify: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    pageExtensions: ['tsx'],
    webpack: (config, { dev }) => {
        config.optimization.minimize = false;
        return config;
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    distDir: '.next', // default untuk menjalankan app
};

module.exports = process.env.NEXT_CONFIG === 'build' ? { ...defaultConfig, ...buildConfig } : defaultConfig;
