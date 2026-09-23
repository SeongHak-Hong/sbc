const fs = require('fs');
let css = fs.readFileSync('src/components/MenuDropdown.module.css', 'utf-8');

css = css.replace(
    /\.iconClose\s*\{\s*display:\s*inline-block\s*!important;\s*\}/,
    `.iconClose {
        display: inline-block !important;
        color: var(--color-slate-700);
    }`
);

fs.writeFileSync('src/components/MenuDropdown.module.css', css);
