import { google } from 'googleapis';
import fs from 'fs';

const SERVICE_ACCOUNT_KEY_PATH = "C:\\Users\\hp\\Downloads\\gen-lang-client-0875361566-006a3bf4d629.json";
const PACKAGE_NAME = "com.pioneers.schoolsystem.official";
const BUNDLE_PATH = "C:\\Users\\hp\\.gemini\\antigravity\\worktrees\\jolly-mendel\\school-system\\android\\app\\build\\outputs\\bundle\\release\\app-release.aab";

async function uploadToPlayStore() {
    const auth = new google.auth.GoogleAuth({
        keyFile: SERVICE_ACCOUNT_KEY_PATH,
        scopes: ['https://www.googleapis.com/auth/androidpublisher']
    });

    const androidPublisher = google.androidpublisher({ version: 'v3', auth });

    try {
        console.log("Starting upload process...");
        
        // 1. Create Edit
        const editRes = await androidPublisher.edits.insert({
            packageName: PACKAGE_NAME
        });
        const editId = editRes.data.id;
        console.log(`Edit created: ${editId}`);

        // 2. Upload Bundle
        console.log("Uploading App Bundle...");
        const bundleRes = await androidPublisher.edits.bundles.upload({
            packageName: PACKAGE_NAME,
            editId: editId,
            media: {
                mimeType: 'application/octet-stream',
                body: fs.createReadStream(BUNDLE_PATH)
            }
        });
        const versionCode = bundleRes.data.versionCode;
        console.log(`Bundle uploaded successfully! Version Code: ${versionCode}`);

        // 3. Assign to Track
        console.log("Assigning to internal track...");
        await androidPublisher.edits.tracks.update({
            packageName: PACKAGE_NAME,
            editId: editId,
            track: 'internal', // Update to internal or alpha as needed
            requestBody: {
                track: 'internal',
                releases: [{
                    name: `Release ${versionCode}`,
                    versionCodes: [versionCode.toString()],
                    status: 'completed',
                }]
            }
        });
        console.log("Track updated.");

        // 4. Commit Edit
        console.log("Committing edit...");
        await androidPublisher.edits.commit({
            packageName: PACKAGE_NAME,
            editId: editId
        });
        
        console.log("Upload completed successfully!");

    } catch (error) {
        console.error("Upload failed:", error);
    }
}

uploadToPlayStore();
