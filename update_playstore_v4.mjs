import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const keyPath = 'C:\\Users\\hp\\Downloads\\gen-lang-client-0875361566-006a3bf4d629.json';
const packageName = 'com.pioneers.schoolsystem.official';
const aabPath = 'android/app/build/outputs/bundle/release/app-release.aab';

async function uploadVersion3() {
  console.log('🚀 Starting Play Store Upload Process for Version 3...');
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: keyPath,
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });

    const androidPublisher = google.androidpublisher({
      version: 'v3',
      auth: auth,
    });

    console.log('📝 Creating a new edit transaction...');
    const editRes = await androidPublisher.edits.insert({
      packageName: packageName,
    });
    const editId = editRes.data.id;
    console.log(`✅ Edit created with ID: ${editId}`);

    console.log(`📦 Uploading AAB file (${aabPath})... this might take a few minutes.`);
    const bundleRes = await androidPublisher.edits.bundles.upload({
      packageName: packageName,
      editId: editId,
      media: {
        mimeType: 'application/octet-stream',
        body: fs.createReadStream(aabPath),
      },
    });
    const versionCode = bundleRes.data.versionCode;
    console.log(`✅ AAB uploaded successfully! Version code: ${versionCode}`);

    console.log(`🚀 Assigning bundle to the 'alpha' (Closed Testing) track...`);
    await androidPublisher.edits.tracks.update({
      packageName: packageName,
      editId: editId,
      track: 'alpha', 
      requestBody: {
        releases: [{
          name: '1.0.2 Advanced Update',
          versionCodes: [versionCode],
          status: 'draft', 
        }],
      },
    });
    console.log(`✅ Track updated successfully!`);

    console.log(`💾 Committing changes to Google Play...`);
    await androidPublisher.edits.commit({
      packageName: packageName,
      editId: editId,
    });
    console.log(`🎉 Version 3 uploaded and committed successfully to Closed Testing!`);

  } catch (err) {
    console.error('❌ Error during upload:');
    if (err.response && err.response.data && err.response.data.error) {
        console.error(err.response.data.error.message);
    } else {
        console.error(err.message);
    }
  }
}
uploadVersion3();
