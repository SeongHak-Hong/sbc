const fs = require('fs');
let css = fs.readFileSync('src/pages/MediaPage.module.css', 'utf8');

css = css.replace(
  /\.videoGrid \{\r?\n    display: flex;\r?\n    flex-direction: column;\r?\n    gap: 48px;\r?\n    width: 100%;\r?\n\}/g,
  `.videoGrid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 48px 24px;
    width: 100%;
}`
);

css = css.replace(
  /\.videoCard \{\r?\n    display: flex;\r?\n    flex-direction: row;\r?\n    gap: 40px;/g,
  `.videoCard {
    display: flex;
    flex-direction: column;
    gap: 16px;`
);

css = css.replace(
  /\.thumbnailContainer \{\r?\n    width: 280px;/g,
  `.thumbnailContainer {
    width: 100%;`
);

css = css.replace(
  /@media \(max-width: 768px\) \{\r?\n    \.videoCard \{\r?\n        flex-direction: column;\r?\n        gap: 16px;\r?\n    \}\r?\n    \r?\n    \.thumbnailContainer \{\r?\n        width: 100%;\r?\n    \}\r?\n    \r?\n    \r?\n\}/g,
  `@media (max-width: 768px) {
    .videoGrid {
        grid-template-columns: 1fr;
        gap: 32px;
    }
}`
);

fs.writeFileSync('src/pages/MediaPage.module.css', css);
console.log('updated');
