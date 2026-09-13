import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const keyPath = 'C:\\Users\\hp\\Downloads\\gen-lang-client-0875361566-006a3bf4d629.json';
const packageName = 'com.pioneers.schoolsystem.official';
const aabPath = 'android/app/build/outputs/bundle/release/app-release.aab';
const screenshotsDir = 'app_screenshots';

async function uploadToPlayStore() {
  console.log('🚀 Starting Play Store Upload Process...');
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: keyPath,
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });

    const androidPublisher = google.androidpublisher({
      version: 'v3',
      auth: auth,
    });

    // 1. Create a new edit
    console.log('📝 Creating a new edit transaction...');
    const editRes = await androidPublisher.edits.insert({
      packageName: packageName,
    });
    const editId = editRes.data.id;
    console.log(`✅ Edit created with ID: ${editId}`);

    // 2. Upload the .aab file
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

    // 3. Assign the bundle to the Internal Testing track
    console.log(`🔄 Assigning bundle to the 'internal' track...`);
    await androidPublisher.edits.tracks.update({
      packageName: packageName,
      editId: editId,
      track: 'internal', // Safe to upload here first, user can promote to production later
      requestBody: {
        releases: [{
          name: '1.0.0 Initial Release',
          versionCodes: [versionCode],
          status: 'draft', // Keeping as draft so user can review it
        }],
      },
    });
    console.log(`✅ Track updated successfully!`);

    // 4. Delete existing screenshots (to prevent duplicates if run multiple times)
    console.log(`🗑️ Clearing old screenshots from listing...`);
    try {
        await androidPublisher.edits.images.deleteall({
            packageName: packageName,
            editId: editId,
            language: 'en-US',
            imageType: 'phoneScreenshots'
        });
    } catch(e) { 
        console.log('No existing screenshots to delete or error ignored.'); 
    }

    // 5. Upload new screenshots (max 8 for phoneScreenshots on Play Store per language typically)
    console.log(`📸 Uploading screenshots...`);
    const files = fs.readdirSync(screenshotsDir)
                    .filter(f => f.endsWith('.png'))
                    .slice(0, 8); // Play store allows max 8 phone screenshots
                    
    for (const file of files) {
      console.log(`   -> Uploading ${file}...`);
      await androidPublisher.edits.images.upload({
        packageName: packageName,
        editId: editId,
        language: 'en-US',
        imageType: 'phoneScreenshots',
        media: {
          mimeType: 'image/png',
          body: fs.createReadStream(path.join(screenshotsDir, file)),
        },
      });
    }
    console.log(`✅ Screenshots uploaded successfully!`);

    // 6. Commit the edit
    console.log(`💾 Committing changes to Google Play...`);
    await androidPublisher.edits.commit({
      packageName: packageName,
      editId: editId,
    });
    console.log(`🎉 Boom! Everything uploaded and committed successfully!`);

  } catch (err) {
    console.error('❌ Error during upload:');
    if (err.response && err.response.data && err.response.data.error) {
        console.error(err.response.data.error.message);
    } else {
        console.error(err.message);
    }
  }
}
uploadToPlayStore();
