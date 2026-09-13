import { Jimp } from 'jimp';

async function processImages() {
    try {
        console.log('Processing Icon...');
        const icon = await Jimp.read('C:\\Users\\hp\\.gemini\\antigravity\\brain\\d766fca3-74b4-469b-8df8-f7626322459c\\pioneers_app_icon_1789211344212.jpg');
        icon.resize({ w: 512, h: 512 });
        await icon.write('C:\\Users\\hp\\.gemini\\antigravity\\worktrees\\jolly-mendel\\school-system\\app_screenshots\\PlayStore_Icon_512x512.jpg');

        console.log('Processing Feature Graphic...');
        const graphic = await Jimp.read('C:\\Users\\hp\\.gemini\\antigravity\\brain\\d766fca3-74b4-469b-8df8-f7626322459c\\pioneers_feature_graphic_1789211379995.jpg');
        graphic.cover({ w: 1024, h: 500 }); // cover will crop nicely to fit exactly 1024x500 without squishing
        await graphic.write('C:\\Users\\hp\\.gemini\\antigravity\\worktrees\\jolly-mendel\\school-system\\app_screenshots\\PlayStore_Feature_Graphic_1024x500.jpg');

        console.log('✅ Done resizing!');
    } catch (err) {
        console.error('Error:', err);
    }
}
processImages();
