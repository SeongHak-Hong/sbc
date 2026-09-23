const fs = require('fs');
const path = require('path');

const jsxFiles = [
    'src/pages/VisionPage.jsx',
    'src/pages/TeamPage.jsx',
    'src/pages/OutreachPage.jsx',
    'src/pages/NewsPage.jsx',
    'src/pages/NetworkPage.jsx',
    'src/pages/MediaPage.jsx',
    'src/pages/GuidePage.jsx',
    'src/pages/EventsPage.jsx',
    'src/pages/CommunityPage.jsx'
];

jsxFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    
    if (!content.includes('import Breadcrumb from')) {
        const importRegex = /^import.*?;?\s*$/gm;
        let lastImportIndex = 0;
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            lastImportIndex = match.index + match[0].length;
        }
        
        const importStatement = '\nimport Breadcrumb from "../components/ui/Breadcrumb";\n';
        content = content.slice(0, lastImportIndex) + importStatement + content.slice(lastImportIndex);
    }
    
    // Replace <div className={styles.breadcrumb}>...</div>
    content = content.replace(/<div className=\{styles\.breadcrumb\}>\s*([\s\S]*?)\s*<\/div>/g, '<Breadcrumb text="$1" />');
    
    // Replace <span className={styles.breadcrumb}>...</span>
    content = content.replace(/<span className=\{styles\.breadcrumb\}>\s*([\s\S]*?)\s*<\/span>/g, '<Breadcrumb text="$1" />');
    
    fs.writeFileSync(file, content);
    console.log('Updated JSX: ' + file);
});

let welcomeContent = fs.readFileSync('src/pages/WelcomePage.jsx', 'utf-8');
if (!welcomeContent.includes('import Breadcrumb from')) {
    const importStatement = "\nimport Breadcrumb from '../components/ui/Breadcrumb';\n";
    welcomeContent = welcomeContent.replace(/import styles from '\.\/WelcomePage\.module\.css';/, "import styles from './WelcomePage.module.css';" + importStatement);
}
welcomeContent = welcomeContent.replace(
    /<motion\.div\s+className=\{styles\.breadcrumb\}[\s\S]*?>\s*공동체 - 새가족\s*<\/motion\.div>/,
    `<Breadcrumb\n                                asMotion\n                                centered\n                                initial={{ opacity: 0, filter: 'blur(10px)' }}\n                                animate={introActiveIndex === 0 ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: 'blur(10px)' }}\n                                transition={{ duration: 1 }}\n                                text="공동체 - 새가족"\n                            />`
);
fs.writeFileSync('src/pages/WelcomePage.jsx', welcomeContent);
console.log('Updated JSX: src/pages/WelcomePage.jsx');
