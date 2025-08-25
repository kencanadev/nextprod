module.exports = {
    apps: [
        {
            name: 'vristo-next',
            script: 'node_modules/next/dist/bin/next',
            // script: 'node_modules/.bin/next',
            args: 'start -H 0.0.0.0 -p 3000',
            cwd: './',
            instances: 1,
            // autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                // PORT: 3000,
            },
        },
    ],
};
