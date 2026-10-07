const fs = require('fs');
let b = fs.readFileSync('android/app/build.gradle', 'utf8');
b = b.replace(/versionCode \d+/, 'versionCode 5');
b = b.replace(/versionName ".*"/, 'versionName "1.0.4"');
fs.writeFileSync('android/app/build.gradle', b);
