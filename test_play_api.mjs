import { google } from 'googleapis';

const keyPath = 'C:\\Users\\hp\\Downloads\\gen-lang-client-0875361566-006a3bf4d629.json';
const packageName = 'com.pioneers.schoolsystem.official';

async function checkApp() {
  console.log('Testing Play Developer API Connection...');
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: keyPath,
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });

    const androidPublisher = google.androidpublisher({
      version: 'v3',
      auth: auth,
    });

    // Try to insert a new edit (this acts as an auth and app existence check)
    const res = await androidPublisher.edits.insert({
      packageName: packageName,
    });

    console.log('✅ API Connection Successful! Edit ID:', res.data.id);
    
    // Clean up / delete the edit
    await androidPublisher.edits.delete({
        packageName: packageName,
        editId: res.data.id
    });
    console.log('✅ App exists and Service Account has the correct permissions.');
  } catch (err) {
    console.error('❌ Error testing API:');
    if (err.response && err.response.data && err.response.data.error) {
        console.error(err.response.data.error.message);
    } else {
        console.error(err.message);
    }
  }
}
checkApp();
