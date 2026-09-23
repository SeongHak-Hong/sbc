const fs = require('fs');

const data = JSON.parse(fs.readFileSync('d:\\me\\design\\sbc-site\\src\\assets\\lottie\\birdies.json', 'utf8'));

const colors = new Set();

function findColors(obj) {
    if (Array.isArray(obj)) {
        obj.forEach(findColors);
    } else if (obj !== null && typeof obj === 'object') {
        if (obj.ty === 'fl' || obj.ty === 'st') { // Fill or Stroke
            if (obj.c && obj.c.k) {
                let k = obj.c.k;
                if (Array.isArray(k) && typeof k[0] === 'number' && k.length >= 3) {
                    const r = Math.round(k[0] * 255);
                    const g = Math.round(k[1] * 255);
                    const b = Math.round(k[2] * 255);
                    colors.add(`rgb(${r}, ${g}, ${b})`);
                } else if (Array.isArray(k) && typeof k[0] === 'object') {
                    // animated color
                    console.log('Animated color found');
                }
            }
        }
        Object.values(obj).forEach(findColors);
    }
}

findColors(data);
console.log('Colors found in birdies.json:');
console.log(Array.from(colors));
