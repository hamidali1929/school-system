const fs = require('fs');
let text = fs.readFileSync('android/app/build.gradle', 'utf8');
text = text.replace('versionCode 3', 'versionCode 4');
text = text.replace('versionName "1.0.2"', 'versionName "1.0.3"');
fs.writeFileSync('android/app/build.gradle', text);
