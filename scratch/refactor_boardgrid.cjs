const fs = require('fs');

let jsx = fs.readFileSync('src/components/ui/BoardGrid.jsx', 'utf8');
jsx = jsx.replace(/className=\{styles\.eventTitle\}/g, 'className={`list-item-title ${styles.eventTitle}`}');
jsx = jsx.replace(/className=\{styles\.eventMetaRow\}/g, 'className={`list-item-meta ${styles.eventMetaRow}`}');
fs.writeFileSync('src/components/ui/BoardGrid.jsx', jsx);

let css = fs.readFileSync('src/components/ui/BoardGrid.module.css', 'utf8');
css = css.replace(/\.eventTitle\s*\{([^}]*)\}/g, (match, body) => {
    let newBody = body.replace(/font-size:[^;]+;/g, '').replace(/font-weight:[^;]+;/g, '').replace(/color:[^;]+;/g, '');
    return `.eventTitle {${newBody}}`;
});
css = css.replace(/\.eventMetaRow\s*\{([^}]*)\}/g, (match, body) => {
    let newBody = body.replace(/font-size:[^;]+;/g, '').replace(/color:[^;]+;/g, '');
    return `.eventMetaRow {${newBody}}`;
});
fs.writeFileSync('src/components/ui/BoardGrid.module.css', css);
