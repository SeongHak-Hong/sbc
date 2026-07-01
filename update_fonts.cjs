const fs = require('fs');
const path = 'd:/me/design/sbc-site/src/index.css';
let content = fs.readFileSync(path, 'utf8');

// 1. Update @font-face to include Regular
const newFontFace = `@font-face {
  font-family: 'SUIT';
  src: url('/fonts/SUIT-Light.woff2') format('woff2');
  font-weight: 300;
  font-style: normal;
}

@font-face {
  font-family: 'SUIT';
  src: url('/fonts/SUIT-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
}

@font-face {
  font-family: 'SUIT';
  src: url('/fonts/SUIT-Medium.woff2') format('woff2');
  font-weight: 500;
  font-style: normal;
}`;

// Replace the old @font-face declarations for SUIT
content = content.replace(
    /@font-face\s*\{\s*font-family:\s*'SUIT';\s*src:\s*url\('\/fonts\/SUIT-Light\.woff2'\)\s*format\('woff2'\);\s*font-style:\s*normal;\s*\}\s*@font-face\s*\{\s*font-family:\s*'SUIT';\s*src:\s*url\('\/fonts\/SUIT-Medium\.woff2'\)\s*format\('woff2'\);\s*font-weight:\s*500;\s*font-style:\s*normal;\s*\}/,
    newFontFace
);

// 2. Change var(--font-weight-light) to var(--font-weight-regular)
content = content.replace(/var\(--font-weight-light\)/g, 'var(--font-weight-regular)');

fs.writeFileSync(path, content, 'utf8');
console.log('index.css updated');
