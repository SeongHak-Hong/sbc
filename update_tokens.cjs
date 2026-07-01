const fs = require('fs');
const path = 'd:/me/design/sbc-site/src/index.css';
let content = fs.readFileSync(path, 'utf8');

// 1. Add tokens
const tokens = `
  /* Font Weight Tokens */
  --font-weight-light: 300;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;

  /* Line-height Tokens */
  --line-height-base: 1.8;
  --line-height-heading: 1.4;
`;

// Insert after /* ?됯컙 (Line-height) */ if it exists
content = content.replace(/\/\*\s*\?\uC410\uC6FB\s*\(Line-height\)\s*\*\//, `/* ?됯컙 (Line-height) */\n${tokens}`);

// If the comment doesn't match properly, insert at the end of :root
if (!content.includes('--line-height-base: 1.8;')) {
    content = content.replace(/--pc-text-body-card: 24px;/, `--pc-text-body-card: 24px;\n${tokens}`);
}

// 2. Update body selector
content = content.replace(
    /body\s*\{\s*font-family:\s*var\(--font-body\);\s*letter-spacing:\s*-0\.05em;/, 
    `body {\n  font-family: var(--font-body);\n  letter-spacing: -0.05em;\n  font-weight: var(--font-weight-light);\n  line-height: var(--line-height-base);`
);

// 3. Update h1-h4 selector
content = content.replace(
    /h1,\s*h2,\s*h3,\s*h4\s*\{\s*font-family:\s*var\(--font-title\);\s*margin-bottom:\s*0\.5em;\s*\}/,
    `h1,\nh2,\nh3,\nh4 {\n  font-family: var(--font-title);\n  font-weight: var(--font-weight-light);\n  line-height: var(--line-height-heading);\n  margin-bottom: 0.5em;\n}`
);

fs.writeFileSync(path, content, 'utf8');
console.log('index.css updated');
