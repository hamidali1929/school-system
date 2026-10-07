import { Jimp } from 'jimp';
import fs from 'fs';

async function updateAndroidIconsWithPadding() {
    try {
        console.log('Reading public/logo1.png...');
        const logo = await Jimp.read('public/logo1.png');

        const sizes = {
            'mdpi': 48,
            'hdpi': 72,
            'xhdpi': 96,
            'xxhdpi': 144,
            'xxxhdpi': 192
        };

        for (const [res, size] of Object.entries(sizes)) {
            const dir = `android/app/src/main/res/mipmap-${res}`;
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

            console.log(`Generating padded ${size}x${size} for ${res}...`);
            
            // Create a white background canvas of the full size
            const bg = new Jimp({ width: size, height: size, color: 0xffffffff });
            
            // The safe zone is usually ~70% of the total size
            const safeSize = Math.floor(size * 0.7);
            const padding = Math.floor((size - safeSize) / 2);
            
            // Resize the logo to fit within the safe zone
            const resizedLogo = logo.clone().resize({ w: safeSize, h: safeSize });
            
            // Paste the logo onto the center of the white background
            bg.composite(resizedLogo, padding, padding);
            
            await bg.write(`${dir}/ic_launcher.png`);
            await bg.write(`${dir}/ic_launcher_round.png`);
            await bg.write(`${dir}/ic_launcher_foreground.png`);
        }

        console.log('Done generating padded Android icons!');
    } catch (err) {
        console.error(err);
    }
}
updateAndroidIconsWithPadding();
