const fs = require('fs');
let css = fs.readFileSync('d:/me/design/sbc-site/src/pages/MediaPage.module.css', 'utf8');

// Replace PC font size (assuming it currently says 22px)
css = css.replace(/\.title\s*\{\s*color:\s*var\(--color-text-primary\);\s*font-size:\s*22px;\s*margin:\s*0;\s*\}/, '.title {\n    color: var(--color-text-primary);\n    font-size: 20px;\n    margin: 0;\n}');

// Replace mobile font size (assuming it currently says 20px)
css = css.replace(/\.title\s*\{\s*font-size:\s*20px;\s*\}/, '.title {\n        font-size: 17px;\n    }');

fs.writeFileSync('d:/me/design/sbc-site/src/pages/MediaPage.module.css', css);
