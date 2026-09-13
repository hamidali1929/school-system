const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

async function zipAndDeploy() {
  const output = fs.createWriteStream('dist.zip');
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', async function() {
    console.log(archive.pointer() + ' total bytes');
    console.log('Zip created successfully. Deploying to Netlify...');
    
    const TOKEN = 'nfp_rsJmvMGRW6DFvRf5KEdZkTtHbqosGNBx278f';
    const SITE_ID = '2a9fdde7-03f0-45d4-b546-02999d0cd52e';
    const zipData = fs.readFileSync('dist.zip');
    
    try {
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
    } catch (e) {
      console.error(e);
    }
  });

  archive.on('error', function(err) {
    throw err;
  });

  archive.pipe(output);
  archive.directory('dist/', false); // false means don't include 'dist' directory itself, just contents
  archive.finalize();
}

zipAndDeploy();
