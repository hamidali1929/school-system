const fs = require('fs');
const path = require('path');
const bestzip = require('bestzip');

const TOKEN = 'nfp_rsJmvMGRW6DFvRf5KEdZkTtHbqosGNBx278f';
const SITE_ID = '2a9fdde7-03f0-45d4-b546-02999d0cd52e';
const ZIP_PATH = path.join(__dirname, 'dist.zip');

async function deploy() {
    console.log('Zipping dist folder using bestzip...');
    
    if (fs.existsSync(ZIP_PATH)) {
        fs.unlinkSync(ZIP_PATH);
    }
    
    await bestzip({
      source: '*',
      destination: '../dist.zip',
      cwd: path.join(__dirname, 'dist')
    });

    console.log('Reading zip file...');
    const zipData = fs.readFileSync(ZIP_PATH);
    console.log(`Zip file size: ${zipData.length} bytes`);

    console.log(`Deploying to Netlify site: ${SITE_ID}...`);
    const res = await fetch(`https://api.netlify.com/api/v1/sites/${SITE_ID}/deploys`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/zip'
        },
        body: zipData
    });

    if (res.ok) {
        const data = await res.json();
        console.log('✅ Netlify Deployment Successful!');
        console.log(`🚀 Live URL: ${data.ssl_url || data.url}`);
    } else {
        const errorText = await res.text();
        console.error(`❌ Deployment Failed: HTTP ${res.status}`);
        console.error(errorText);
    }
}

deploy();
