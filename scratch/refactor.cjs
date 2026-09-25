const fs = require('fs');
const path = require('path');

const srcDir = path.join('d:', 'me', 'design', 'sbc-site', 'src');

const pagesDir = path.join(srcDir, 'pages');
const compDir = path.join(srcDir, 'components');

const filesToProcess = [];

function findFiles(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
            findFiles(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.css')) {
            filesToProcess.push(fullPath);
        }
    }
}

findFiles(pagesDir);
findFiles(compDir);
filesToProcess.push(path.join(srcDir, 'index.css'));

// 1. In index.css, remove .yuhan-title
const indexCssPath = path.join(srcDir, 'index.css');
let indexCss = fs.readFileSync(indexCssPath, 'utf-8');
indexCss = indexCss.replace(/\.yuhan-title\s*\{[\s\S]*?\}/g, '');
fs.writeFileSync(indexCssPath, indexCss);

console.log("Cleaned index.css");

// 2. We have specific known classes:
const knownClasses = [
    'pageTitle', 'headerMainTitle', 'yuhanTitle', 'yuhanText', '_mainText', 'title'
];

for (const file of filesToProcess) {
    if (file.endsWith('.module.css')) {
        let content = fs.readFileSync(file, 'utf-8');
        let modified = false;
        
        // Remove known classes entirely if they have 40px, or just remove the 40px block.
        // Actually, let's just remove the class block if it contains 40px.
        const regex = /\.([a-zA-Z0-9_-]+)\s*\{([^}]*font-size:\s*40px[^}]*)\}/g;
        content = content.replace(regex, (match, className, inner) => {
            console.log(`Removing ${className} from ${path.basename(file)}`);
            modified = true;
            return '';
        });

        // Also remove mobile media queries for these classes... this is tricky with regex.
        // I will just remove the whole .yuhanText and .yuhanTitle anywhere.
        const yuhanRegex = /\.yuhan(Text|Title)\s*\{[\s\S]*?\}/g;
        content = content.replace(yuhanRegex, () => { modified = true; return ''; });

        if (modified) fs.writeFileSync(file, content);
    } 
    else if (file.endsWith('.jsx')) {
        let content = fs.readFileSync(file, 'utf-8');
        let modified = false;

        // Replace className={styles.xxx} with className="main-page-title" 
        // for our known title classes.
        for (const cls of knownClasses) {
            const clsRegex = new RegExp(`className=\\{styles\\.${cls}\\}`, 'g');
            if (clsRegex.test(content)) {
                console.log(`Replacing styles.${cls} in ${path.basename(file)}`);
                content = content.replace(clsRegex, 'className="main-page-title"');
                modified = true;
            }
        }
        
        if (modified) fs.writeFileSync(file, content);
    }
}

console.log("Done refactoring titles!");
