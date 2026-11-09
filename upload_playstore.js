import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

// Load credentials
const keyPath = path.resolve('playstore-api.json');
const aabPath = path.resolve('PioneerSchool-v22.aab');

const auth = new google.auth.GoogleAuth({
  keyFile: keyPath,
  scopes: ['https://www.googleapis.com/auth/androidpublisher']
});

const packageName = 'com.pioneers.schoolsystem.official';

async function uploadToPlayStore() {
  try {
    console.log('Authenticating with Google Play...');
    const authClient = await auth.getClient();
    const play = google.androidpublisher({
      version: 'v3',
      auth: authClient
    });

    console.log('Creating Edit...');
    const editRes = await play.edits.insert({
      packageName: packageName
    });
    
    const editId = editRes.data.id;
    console.log('Edit created:', editId);

    console.log('Uploading AAB...');
    const aabRes = await play.edits.bundles.upload({
      packageName: packageName,
      editId: editId,
      media: {
        mimeType: 'application/octet-stream',
        body: fs.createReadStream(aabPath)
      }
    });

    const versionCode = aabRes.data.versionCode;
    console.log('Uploaded Bundle with version code:', versionCode);

    console.log('Assigning track (internal)...');
    await play.edits.tracks.update({
      packageName: packageName,
      editId: editId,
      track: 'internal',
      requestBody: {
        releases: [{
          versionCodes: [versionCode],
          status: 'completed'
        }]
      }
    });

    console.log('Committing Edit...');
    await play.edits.commit({
      packageName: packageName,
      editId: editId
    });

    console.log('Upload successful!');
  } catch (err) {
    console.error('Error uploading to Play Store:', err.message);
    if (err.errors) {
      console.error(err.errors);
    }
  }
}

uploadToPlayStore();
