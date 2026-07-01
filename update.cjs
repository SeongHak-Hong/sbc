const fs = require('fs');

const path = 'd:/me/design/sbc-site/src/index.css';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove @import
content = content.replace(/@import url\([\s\S]*?pretendard.*?;\r?\n?/g, '');

// 2. Replace @font-face blocks
const newFontFaces = `
@font-face {
  font-family: 'SUIT';
  src: url('/fonts/SUIT-Light.woff2') format('woff2');
  font-weight: 300;
  font-style: normal;
}

@font-face {
  font-family: 'SUIT';
  src: url('/fonts/SUIT-Medium.woff2') format('woff2');
  font-weight: 500;
  font-style: normal;
}

@font-face {
  font-family: 'Playfair Display';
  src: url('/fonts/PlayfairDisplay-Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
}
`;

content = content.replace(/@font-face\s*\{[\s\S]*?\}/g, '');
content = newFontFaces.trim() + '\n\n' + content.trim();

// 3. Update CSS variables
content = content.replace(/--font-title:\s*'LXGWWenKaiMonoKR',\s*sans-serif;/g, "--font-title: 'SUIT', sans-serif;");
content = content.replace(/--font-body:\s*'Pretendard',\s*sans-serif;/g, "--font-body: 'SUIT', sans-serif;");
content = content.replace(/--font-letter:\s*'Pretendard',\s*sans-serif;/g, "--font-letter: 'SUIT', sans-serif;");
content = content.replace(/--font-btn:\s*'Pretendard',\s*sans-serif;/g, "--font-btn: 'SUIT', sans-serif;");

// 4. Remove leading variables and base letter spacing
content = content.replace(/--leading-title:[^\n]+?\n/g, '');
content = content.replace(/--leading-body:[^\n]+?\n/g, '');
content = content.replace(/--letter-spacing-base:[^\n]+?\n/g, '');

// 5. Update body
content = content.replace(/letter-spacing:\s*var\(--letter-spacing-base\);/g, "letter-spacing: -0.05em;");
content = content.replace(/line-height:\s*var\(--leading-body\);\r?\n/g, "");

// 6. Update headers (h1-h4 blocks and single tags in mobile)
content = content.replace(/line-height:\s*var\(--leading-title\);\r?\n/g, "");
content = content.replace(/letter-spacing:\s*-0\.1em;.*?\r?\n/g, "");

// 7. Update p block
content = content.replace(/letter-spacing:\s*-0\.02em;.*?\r?\n/g, "");
content = content.replace(/font-weight:\s*400;.*?\r?\n/g, "");

// 8. Update button block
content = content.replace(/font-family:\s*'Pretendard',\s*sans-serif;/g, "font-family: 'SUIT', sans-serif;");
content = content.replace(/font-weight:\s*300;.*?\r?\n/g, "");
content = content.replace(/line-height:\s*1\.8;.*?\r?\n/g, "");

// Cleanup duplicate empty lines
content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated index.css');
