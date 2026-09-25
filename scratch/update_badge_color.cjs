const fs = require('fs');
const path = 'src/pages/MediaPage.module.css';
let css = fs.readFileSync(path, 'utf-8');

css = css.replace(/(\.badge\s*\{[^}]*?color:\s*)var\(--color-text-secondary\)/, '$1var(--color-text-tertiary)');

fs.writeFileSync(path, css);
