const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

const newTokens = `
  /* List Item Tokens */
  --list-title-size-pc: 20px;
  --list-title-size-mobile: 17px;
  --list-meta-size-pc: 16px;
  --list-meta-size-mobile: 14px;
`;

if (!css.includes('--list-title-size-pc')) {
    css = css.replace('  /* Main Page Title Tokens */', newTokens + '\n  /* Main Page Title Tokens */');
}

const newClasses = `
/* Global List Item Styles */
.list-item-title {
  font-size: var(--list-title-size-pc);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: var(--line-height-base);
  word-break: keep-all;
}

.list-item-meta {
  font-size: var(--list-meta-size-pc);
  font-weight: var(--font-weight-regular);
  color: var(--color-text-muted);
  margin: 0;
  line-height: var(--line-height-base);
}

@media (max-width: 767px) {
  .list-item-title {
    font-size: var(--list-title-size-mobile);
  }
  .list-item-meta {
    font-size: var(--list-meta-size-mobile);
  }
}
`;

if (!css.includes('.list-item-title')) {
    css += '\n' + newClasses;
}

fs.writeFileSync('src/index.css', css);
