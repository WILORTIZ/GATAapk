import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const sourceImage = 'C:\\Users\\ANDRES\\.gemini\\antigravity-ide\\brain\\d09090e4-77ec-4aad-ba3c-d92bfcf8557d\\garfield_cat_icon_1788138612992.jpg';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

async function run() {
  console.log('Generating icons from:', sourceImage);

  // 1. Web icons
  await sharp(sourceImage)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'cat-icon.png'));
  console.log('Created public/cat-icon.png');

  await sharp(sourceImage)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('Created public/favicon.png');

  // 2. Android mipmaps
  const mipmaps = [
    { dir: 'mipmap-mdpi', size: 48 },
    { dir: 'mipmap-hdpi', size: 72 },
    { dir: 'mipmap-xhdpi', size: 96 },
    { dir: 'mipmap-xxhdpi', size: 144 },
    { dir: 'mipmap-xxxhdpi', size: 192 },
  ];

  const androidRes = path.resolve('android/app/src/main/res');

  for (const m of mipmaps) {
    const targetDir = path.join(androidRes, m.dir);
    if (fs.existsSync(targetDir)) {
      // Standard icon
      await sharp(sourceImage)
        .resize(m.size, m.size)
        .png()
        .toFile(path.join(targetDir, 'ic_launcher.png'));

      // Round icon
      await sharp(sourceImage)
        .resize(m.size, m.size)
        .png()
        .toFile(path.join(targetDir, 'ic_launcher_round.png'));

      // Foreground icon
      await sharp(sourceImage)
        .resize(m.size, m.size)
        .png()
        .toFile(path.join(targetDir, 'ic_launcher_foreground.png'));

      console.log(`Generated ${m.dir} icons (${m.size}x${m.size})`);
    }
  }

  // 3. Splash screens in drawables
  const drawables = [
    'drawable',
    'drawable-port-mdpi',
    'drawable-port-hdpi',
    'drawable-port-xhdpi',
    'drawable-port-xxhdpi',
    'drawable-port-xxxhdpi',
    'drawable-land-mdpi',
    'drawable-land-hdpi',
    'drawable-land-xhdpi',
    'drawable-land-xxhdpi',
    'drawable-land-xxxhdpi'
  ];

  for (const d of drawables) {
    const splashDir = path.join(androidRes, d);
    if (fs.existsSync(splashDir)) {
      const splashPath = path.join(splashDir, 'splash.png');
      await sharp(sourceImage)
        .resize(480, 480)
        .png()
        .toFile(splashPath);
    }
  }
  console.log('Generated splash screens');

  console.log('All icons generated successfully!');
}

run().catch(console.error);
