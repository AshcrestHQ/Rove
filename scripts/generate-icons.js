import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';
import pngToIco from 'png-to-ico';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgPath = path.join(__dirname, '../assets/branding/icon.svg');
const brandingDir = path.join(__dirname, '../assets/branding');
const buildDir = path.join(__dirname, '../build');

if (!fs.existsSync(brandingDir)) {
  fs.mkdirSync(brandingDir, { recursive: true });
}
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

const svgContent = fs.readFileSync(svgPath, 'utf8');

const sizes = [16, 32, 48, 64, 128, 256, 512];
const generatedPngPaths = [];

for (const size of sizes) {
  const resvg = new Resvg(svgContent, {
    fitTo: {
      mode: 'width',
      value: size,
    },
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  const outPath = path.join(brandingDir, `icon-${size}.png`);
  fs.writeFileSync(outPath, pngBuffer);
  if (size <= 256) {
    generatedPngPaths.push(outPath);
  }
}

// Copy 256 as main icon.png
fs.copyFileSync(path.join(brandingDir, 'icon-256.png'), path.join(brandingDir, 'icon.png'));

// Also copy to public for web preview
fs.copyFileSync(path.join(brandingDir, 'icon-256.png'), path.join(__dirname, '../public/icon.png'));

console.log('Generating multi-resolution Windows ICO file...');
pngToIco(generatedPngPaths)
  .then((buf) => {
    const icoPath = path.join(brandingDir, 'icon.ico');
    fs.writeFileSync(icoPath, buf);
    // Also place in build/ for electron-builder default discovery
    fs.writeFileSync(path.join(buildDir, 'icon.ico'), buf);
    console.log(`Successfully generated icon.ico at ${icoPath} (${buf.length} bytes)`);
  })
  .catch((err) => {
    console.error('Error generating ICO:', err);
    process.exit(1);
  });
