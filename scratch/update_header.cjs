const fs = require('fs');

// 1. Update index.css
let indexCss = fs.readFileSync('src/index.css', 'utf-8');
indexCss = indexCss.replace(
    /--header-padding-y: 16px;\s*--header-padding-x: 16px;\s*--header-logo-height: 24px;/g,
    `--header-padding-y: 8px;
    --header-padding-right: 8px;
    --header-padding-left: 16px;
    --header-logo-height: 20px;`
);
fs.writeFileSync('src/index.css', indexCss);

// 2. Update Header.jsx
let headerJsx = fs.readFileSync('src/components/Header.jsx', 'utf-8');
headerJsx = headerJsx.replace(
    /paddingLeft: 'var\(--header-padding-x\)',\s*paddingRight: 'var\(--header-padding-x\)',/,
    `paddingLeft: 'var(--header-padding-left, var(--header-padding-x))',\n        paddingRight: 'var(--header-padding-right, var(--header-padding-x))',`
);

headerJsx = headerJsx.replace(
    /<span className=\{\`material-symbols-outlined \$\{styles\.iconMenu\}\`\} translate="no">menu<\/span>/,
    `<img src="/icon-menu.svg" alt="menu" className={styles.iconMenu} />`
);
fs.writeFileSync('src/components/Header.jsx', headerJsx);

// 3. Update MenuDropdown.module.css
let menuCss = fs.readFileSync('src/components/MenuDropdown.module.css', 'utf-8');
menuCss = menuCss.replace(
    /@media \(max-width: 767px\) \{\s*\.toggleBtn \{\s*padding: 8px;\s*\}/,
    `@media (max-width: 767px) {
    .toggleBtn {
        padding: 8px;
        background-color: transparent;
    }
    
    .toggleBtn:hover {
        background-color: transparent;
    }`
);
fs.writeFileSync('src/components/MenuDropdown.module.css', menuCss);
console.log('Done');
