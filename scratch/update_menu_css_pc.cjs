const fs = require('fs');
let css = fs.readFileSync('src/components/MenuDropdown.module.css', 'utf-8');

// Replace .iconMenu
css = css.replace(/\.iconMenu\s*\{\s*width:\s*32px;\s*height:\s*32px;\s*\}/, 
`.iconMenu {
    width: 32px;
    height: 32px;
    display: none;
}`);

// Replace .iconClose
css = css.replace(/\.iconClose\s*\{\s*font-size:\s*32px\s*!important;\s*\}/, 
`.iconClose {
    font-size: 32px !important;
    display: none !important;
}`);

// Replace .toggleBtnText
css = css.replace(/\.toggleBtnText\s*\{\s*display:\s*none;\s*\}/, 
`.toggleBtnText {
        display: none;
    }

    .iconMenu {
        display: block;
    }

    .iconClose {
        display: inline-block !important;
    }`);

fs.writeFileSync('src/components/MenuDropdown.module.css', css);
