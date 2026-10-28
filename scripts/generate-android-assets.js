const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const resDir = path.join(__dirname, '../android/app/src/main/res');

// Read the mosque logo SVG
const svgPath = path.join(__dirname, '../public/icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

// Launcher icon densities
const iconDensities = [
  { dir: 'mipmap-mdpi', size: 48, fgSize: 108 },
  { dir: 'mipmap-hdpi', size: 72, fgSize: 162 },
  { dir: 'mipmap-xhdpi', size: 96, fgSize: 216 },
  { dir: 'mipmap-xxhdpi', size: 144, fgSize: 324 },
  { dir: 'mipmap-xxxhdpi', size: 192, fgSize: 432 },
];

// Splash screen densities
const splashScreens = [
  { dir: 'drawable', w: 480, h: 320 },
  { dir: 'drawable-port-mdpi', w: 320, h: 480 },
  { dir: 'drawable-port-hdpi', w: 480, h: 800 },
  { dir: 'drawable-port-xhdpi', w: 720, h: 1280 },
  { dir: 'drawable-port-xxhdpi', w: 960, h: 1600 },
  { dir: 'drawable-port-xxxhdpi', w: 1280, h: 1920 },
  { dir: 'drawable-land-mdpi', w: 480, h: 320 },
  { dir: 'drawable-land-hdpi', w: 800, h: 480 },
  { dir: 'drawable-land-xhdpi', w: 1280, h: 720 },
  { dir: 'drawable-land-xxhdpi', w: 1600, h: 960 },
  { dir: 'drawable-land-xxxhdpi', w: 1920, h: 1280 },
];

async function generateAssets() {
  console.log('Generating Android App Icons...');

  for (const item of iconDensities) {
    const targetDir = path.join(resDir, item.dir);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    // 1. Full Launcher Icon (Square & Round)
    await sharp(svgBuffer)
      .resize(item.size, item.size)
      .png()
      .toFile(path.join(targetDir, 'ic_launcher.png'));

    await sharp(svgBuffer)
      .resize(item.size, item.size)
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_round.png'));

    // 2. Foreground Adaptive Icon (Centered within 65% safe zone of fgSize)
    const innerSize = Math.round(item.fgSize * 0.65);
    const innerLogoBuffer = await sharp(svgBuffer)
      .resize(innerSize, innerSize)
      .png()
      .toBuffer();

    await sharp({
      create: {
        width: item.fgSize,
        height: item.fgSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([{ input: innerLogoBuffer, gravity: 'center' }])
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_foreground.png'));

    console.log(`Generated icons for ${item.dir}`);
  }

  // Update background color in values/ic_launcher_background.xml
  const bgColorXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#0a1f18</color>
</resources>
`;
  fs.writeFileSync(path.join(resDir, 'values/ic_launcher_background.xml'), bgColorXml);

  console.log('Generating Splash Screens...');

  for (const splash of splashScreens) {
    const targetDir = path.join(resDir, splash.dir);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    // Logo size proportional to min dimension (35%)
    const minDim = Math.min(splash.w, splash.h);
    const logoSize = Math.round(minDim * 0.35);

    const logoBuffer = await sharp(svgBuffer)
      .resize(logoSize, logoSize)
      .png()
      .toBuffer();

    await sharp({
      create: {
        width: splash.w,
        height: splash.h,
        channels: 4,
        background: { r: 10, g: 31, b: 24, alpha: 1 } // #0a1f18
      }
    })
      .composite([{ input: logoBuffer, gravity: 'center' }])
      .png()
      .toFile(path.join(targetDir, 'splash.png'));

    console.log(`Generated splash for ${splash.dir} (${splash.w}x${splash.h})`);
  }

  console.log('All Android assets generated successfully!');
}

generateAssets().catch(console.error);
