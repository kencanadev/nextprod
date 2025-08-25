const { execSync } = require('child_process');
const fsExtra = require('fs-extra');
const path = require('path');

function run(cmd) {
    console.log(`Running: ${cmd}`);
    execSync(cmd, { stdio: 'inherit' });
}

(async () => {
    try {
        // console.log('🛑 Stopping PM2 before build...');
        // run('pm2 stop vristo-next');
        // pull from new repo
        run('git pull origin main');

        // Hapus cache build-temp agar file .pack tidak terkunci
        const buildTempCache = path.join(__dirname, 'build-temp');
        if (fsExtra.existsSync(buildTempCache)) {
            console.log('🧹 Removing build-temp cache before build...');
            fsExtra.removeSync(buildTempCache);
        }

        console.log('📦 Building with custom distDir (build-temp)...');
        run('cross-env NEXT_CONFIG=build NODE_ENV=production next build');

        console.log('🔁 Swapping build-temp → .next...');
        fsExtra.removeSync('.next');
        fsExtra.copySync('build-temp', '.next');

        console.log('🚀 Restarting PM2...');
        // Sebelumnya Jalankan Restart
        // run('pm2 restart vristo-next');

        run('pm2 stop vristo-next');
        run('pm2 start vristo-next');

        console.log('✅ Zero-downtime deployment completed.');
    } catch (err) {
        console.error('❌ Deployment failed:', err);
        process.exit(1);
    }
})();
