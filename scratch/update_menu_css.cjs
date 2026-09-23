const fs = require('fs');
let lines = fs.readFileSync('src/components/MenuDropdown.module.css', 'utf-8').split('\r\n');
lines.splice(31, 36,
    '',
    '.iconMenu {',
    '    width: 32px;',
    '    height: 32px;',
    '}',
    '',
    '.iconClose {',
    '    font-size: 32px !important;',
    '}'
);
fs.writeFileSync('src/components/MenuDropdown.module.css', lines.join('\r\n'));
