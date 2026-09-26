const fs = require('fs');
let css = fs.readFileSync('src/pages/MediaPage.module.css', 'utf8');

css = css.replace(
  /\.videoCard \{\r?\n    display: flex;\r?\n    flex-direction: column;\r?\n    gap: 16px;/g,
  `.videoCard {
    display: flex;
    flex-direction: row;
    gap: 24px;`
);

css = css.replace(
  /\.thumbnailContainer \{\r?\n    width: 100%;/g,
  `.thumbnailContainer {
    width: 280px;`
);

css = css.replace(
  /@media \(max-width: 768px\) \{\r?\n    \.videoGrid \{\r?\n        grid-template-columns: 1fr;\r?\n        gap: 32px;\r?\n    \}\r?\n\}/g,
  `@media (max-width: 768px) {
    .videoGrid {
        grid-template-columns: 1fr;
        gap: 32px;
    }
    .videoCard {
        flex-direction: column;
        gap: 16px;
    }
    .thumbnailContainer {
        width: 100%;
    }
}`
);

fs.writeFileSync('src/pages/MediaPage.module.css', css);
console.log('updated to row layout');
