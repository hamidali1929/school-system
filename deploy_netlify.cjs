const fs = require('fs');
const path = require('path');

const TOKEN = 'nfp_rsJmvMGRW6DFvRf5KEdZkTtHbqosGNBx278f';
const SITE_ID = '2a9fdde7-03f0-45d4-b546-02999d0cd52e';
const ZIP_PATH = path.join(__dirname, 'dist.zip');

async function deploy() {
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
        console.log(`📋 Deploy ID: ${data.id}`);
        console.log(`🔗 Admin URL: ${data.admin_url}`);
    } else {
        const errorText = await res.text();
        console.error(`❌ Deployment Failed: HTTP ${res.status}`);
        console.error(errorText);
    }
}

deploy();
