const fs = require('fs');
let lines = fs.readFileSync('src/components/Header.jsx', 'utf-8').split('\r\n');
lines.splice(187, 4,
    '                    {isMenuOpen ? (',
    '                        <span className={`material-symbols-outlined ${styles.iconClose}`} translate="no">close</span>',
    '                    ) : (',
    '                        <img src="/icon-menu.svg" alt="menu" className={styles.iconMenu} />',
    '                    )}'
);
fs.writeFileSync('src/components/Header.jsx', lines.join('\r\n'));
