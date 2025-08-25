// next.config.build.js
module.exports = {
    distDir: 'build-temp',
    webpack: (config, { isServer }) => {
        config.optimization.minimize = false;
        return config;
    },
};
