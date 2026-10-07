const fs = require('fs');
let b = fs.readFileSync('android/app/build.gradle', 'utf8');
b = b.replace(/versionCode \d+/, 'versionCode 8');
b = b.replace(/versionName ".*"/, 'versionName "1.0.7"');
fs.writeFileSync('android/app/build.gradle', b);
