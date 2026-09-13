const fs = require('fs');
let b = fs.readFileSync('android/app/build.gradle', 'utf8');
b = b.replace('versionCode 2', 'versionCode 3');
b = b.replace('versionName "1.0.1"', 'versionName "1.0.2"');
fs.writeFileSync('android/app/build.gradle', b);
console.log('Version updated!');
