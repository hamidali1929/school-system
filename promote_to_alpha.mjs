import { google } from 'googleapis';

const keyPath = 'C:\\Users\\hp\\Downloads\\gen-lang-client-0875361566-006a3bf4d629.json';
const packageName = 'com.pioneers.schoolsystem.official';

async function promoteToClosedTesting() {
  console.log('🚀 Promoting app to Closed Testing (Alpha Track)...');
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: keyPath,
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });

    const androidPublisher = google.androidpublisher({
      version: 'v3',
      auth: auth,
    });

    // 1. Create edit
    const editRes = await androidPublisher.edits.insert({ packageName });
    const editId = editRes.data.id;
    console.log(`✅ Edit created: ${editId}`);

    // 2. Update the 'alpha' track (Closed testing)
    await androidPublisher.edits.tracks.update({
      packageName: packageName,
      editId: editId,
      track: 'alpha',
      requestBody: {
        releases: [{
          name: '1.0.0 Closed Testing Release',
          versionCodes: [2], // The version code we uploaded earlier
          status: 'draft', // Draft is safer, they just click "Rollout"
        }],
      },
    });
    console.log(`✅ Alpha track updated!`);

    // 3. Commit
    await androidPublisher.edits.commit({ packageName, editId });
    console.log(`🎉 Successfully pushed to Closed Testing!`);

  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.response && err.response.data && err.response.data.error) {
        console.error(err.response.data.error.message);
    }
  }
}
promoteToClosedTesting();
