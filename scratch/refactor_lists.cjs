const fs = require('fs');

function refactorMedia() {
    let jsx = fs.readFileSync('src/pages/MediaPage.jsx', 'utf8');
    jsx = jsx.replace(/className=\{styles\.title\}/g, 'className="list-item-title"');
    jsx = jsx.replace(/className=\{styles\.description\}/g, 'className={`list-item-meta ${styles.description}`}');
    fs.writeFileSync('src/pages/MediaPage.jsx', jsx);

    let css = fs.readFileSync('src/pages/MediaPage.module.css', 'utf8');
    // Remove .title and its contents
    css = css.replace(/\.title\s*\{[^}]*\}/g, '');
    // Only keep extra properties in .description if needed, or remove font-size/color
    css = css.replace(/\.description\s*\{[^}]*\}/g, '.description {\n    margin: 0;\n    display: -webkit-box;\n    -webkit-line-clamp: 2;\n    -webkit-box-orient: vertical;\n    overflow: hidden;\n    text-overflow: ellipsis;\n}');
    fs.writeFileSync('src/pages/MediaPage.module.css', css);
}

function refactorEvents() {
    let jsx = fs.readFileSync('src/pages/EventsPage.jsx', 'utf8');
    jsx = jsx.replace(/className=\{styles\.eventTitle\}/g, 'className={`list-item-title ${styles.eventTitle}`}');
    jsx = jsx.replace(/className=\{styles\.eventMetaRow\}/g, 'className={`list-item-meta ${styles.eventMetaRow}`}');
    fs.writeFileSync('src/pages/EventsPage.jsx', jsx);

    let css = fs.readFileSync('src/pages/EventsPage.module.css', 'utf8');
    // Remove font-size and color from eventTitle
    css = css.replace(/\.eventTitle\s*\{([^}]*)\}/g, (match, body) => {
        let newBody = body.replace(/font-size:[^;]+;/g, '').replace(/color:[^;]+;/g, '');
        return `.eventTitle {${newBody}}`;
    });
    // Remove font-size and color from eventMetaRow
    css = css.replace(/\.eventMetaRow\s*\{([^}]*)\}/g, (match, body) => {
        let newBody = body.replace(/font-size:[^;]+;/g, '').replace(/color:[^;]+;/g, '');
        return `.eventMetaRow {${newBody}}`;
    });
    fs.writeFileSync('src/pages/EventsPage.module.css', css);
}

function refactorNews() {
    let jsx = fs.readFileSync('src/pages/NewsPage.jsx', 'utf8');
    jsx = jsx.replace(/className=\{styles\.eventTitle\}/g, 'className={`list-item-title ${styles.eventTitle}`}');
    jsx = jsx.replace(/className=\{styles\.eventMetaRow\}/g, 'className={`list-item-meta ${styles.eventMetaRow}`}');
    fs.writeFileSync('src/pages/NewsPage.jsx', jsx);

    let css = fs.readFileSync('src/pages/NewsPage.module.css', 'utf8');
    // Remove font-size, font-weight, color from eventTitle
    css = css.replace(/\.eventTitle\s*\{([^}]*)\}/g, (match, body) => {
        let newBody = body.replace(/font-size:[^;]+;/g, '').replace(/font-weight:[^;]+;/g, '').replace(/color:[^;]+;/g, '');
        return `.eventTitle {${newBody}}`;
    });
    // Remove font-size and color from eventMetaRow
    css = css.replace(/\.eventMetaRow\s*\{([^}]*)\}/g, (match, body) => {
        let newBody = body.replace(/font-size:[^;]+;/g, '').replace(/color:[^;]+;/g, '');
        return `.eventMetaRow {${newBody}}`;
    });
    fs.writeFileSync('src/pages/NewsPage.module.css', css);
}

refactorMedia();
refactorEvents();
refactorNews();
