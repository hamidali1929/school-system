import { Jimp } from 'jimp';

async function makePlayStoreAssets() {
    try {
        console.log('Reading original logo...');
        const originalLogo = await Jimp.read('public/logo1.png');

        // 1. Make 512x512 Icon
        console.log('Creating 512x512 Icon...');
        // Create a 512x512 white background
        const icon = new Jimp({ width: 512, height: 512, color: 0xffffffff });
        // Resize original logo to 400x400 to fit nicely with padding
        const logoForIcon = originalLogo.clone().resize({ w: 400, h: 400 });
        // Paste logo onto background
        icon.composite(logoForIcon, 56, 56);
        await icon.write('app_screenshots/PlayStore_Icon_512x512.png');

        // 2. Make 1024x500 Feature Graphic
        console.log('Creating 1024x500 Feature Graphic...');
        // Create a 1024x500 background (light gray/blueish to look professional)
        const banner = new Jimp({ width: 1024, height: 500, color: 0xf0f4f8ff });
        // Resize logo for banner
        const logoForBanner = originalLogo.clone().resize({ w: 300, h: 300 });
        // Center it (1024 - 300)/2 = 362, (500 - 300)/2 = 100
        banner.composite(logoForBanner, 362, 100);
        await banner.write('app_screenshots/PlayStore_Feature_Graphic_1024x500.png');

        console.log('✅ Created properly sized assets in app_screenshots folder!');
    } catch (err) {
        console.error('Error:', err);
    }
}
makePlayStoreAssets();
