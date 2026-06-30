const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.jsx') || file.endsWith('.css')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./src');

files.forEach(file => {
    if (file.includes('YoutubeSection.jsx')) return; // Ignore iPhone mockup
    if (file.includes('LanyardCanvas.jsx')) return; // Ignore 3D canvas/svg
    
    let content = fs.readFileSync(file, 'utf8');
    let newContent = content;

    // Remove CSS border-radius
    newContent = newContent.replace(/border-radius:\s*[^;]+;/g, 'border-radius: 0;');
    
    // Remove React inline borderRadius
    newContent = newContent.replace(/borderRadius:\s*['"]?[^'",}\s]+['"]?/g, 'borderRadius: 0');

    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log('Updated ' + file);
    }
});
