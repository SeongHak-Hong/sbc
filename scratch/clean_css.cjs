const fs = require('fs');
const path = require('path');

const cssFiles = [
    'src/pages/VisionPage.module.css',
    'src/pages/TeamPage.module.css',
    'src/pages/OutreachPage.module.css',
    'src/pages/NewsPage.module.css',
    'src/pages/NetworkPage.module.css',
    'src/pages/MediaPage.module.css',
    'src/pages/GuidePage.module.css',
    'src/pages/EventsPage.module.css',
    'src/pages/CommunityPage.module.css',
    'src/pages/WelcomePage.module.css'
];

cssFiles.forEach(file => {
    try {
        let content = fs.readFileSync(file, 'utf-8');
        
        // Remove .breadcrumb { ... }
        content = content.replace(/\.breadcrumb\s*\{[^}]+\}/g, '');
        
        // Remove empty @media (max-width: 600px) {} if any
        content = content.replace(/@media\s*\(\s*max-width:\s*600px\s*\)\s*\{\s*\}/g, '');
        
        // For files that have .breadcrumb inline with other media query contents (TeamPage, OutreachPage)
        // Wait, the first regex will remove `.breadcrumb { ... }` wherever it is, even inside a media query.
        
        fs.writeFileSync(file, content);
        console.log('Updated CSS: ' + file);
    } catch (e) {
        console.error('Error with ' + file + ': ' + e.message);
    }
});
