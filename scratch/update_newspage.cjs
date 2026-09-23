const fs = require('fs');

let content = fs.readFileSync('src/pages/NewsPage.jsx', 'utf-8');

// 1. Update TABS
content = content.replace(
    /const TABS = \[\s*\{ id: 'koinonia', label: '공지사항' \},\s*\{ id: 'news', label: '교회소식' \},\s*\{ id: 'bulletin', label: '주보' \}\s*\];/,
    `const TABS = [
    { id: 'koinonia', label: '공지사항' },
    { id: 'news', label: '교회소식' },
    { id: 'bulletin', label: '주보' },
    { id: 'network', label: '성도사업' }
];`
);

// 2. Update query in useEffect URL handling
content = content.replace(
    /if \(tab === 'news' \|\| tab === 'bulletin' \|\| tab === 'koinonia'\) \{/,
    `if (tab === 'news' || tab === 'bulletin' || tab === 'koinonia' || tab === 'network') {`
);

// 3. Update fetchPosts
content = content.replace(
    /const kq = query\(collection\(db, 'membersNews'\), orderBy\('createdAt', 'desc'\)\);\s*const \[querySnapshot, koinoniaSnapshot\] = await Promise\.all\(\[getDocs\(q\), getDocs\(kq\)]\);/,
    `const kq = query(collection(db, 'membersNews'), orderBy('createdAt', 'desc'));
            const nq = query(collection(db, 'memberBusiness'), orderBy('createdAt', 'desc'));
            const [querySnapshot, koinoniaSnapshot, networkSnapshot] = await Promise.all([getDocs(q), getDocs(kq), getDocs(nq)]);`
);

content = content.replace(
    /koinoniaSnapshot\.forEach\(\(doc\) => \{\s*const docData = doc\.data\(\);\s*let dateStr = docData\.date;\s*if \(\!dateStr && docData\.createdAt\) \{\s*const d = docData\.createdAt\.toDate\(\);\s*dateStr = \`\$\{d\.getFullYear\(\)\}\. \$\{String\(d\.getMonth\(\) \+ 1\)\.padStart\(2, '0'\)\}\. \$\{String\(d\.getDate\(\)\)\.padStart\(2, '0'\)\}\.\`;\s*\}\s*data\.push\(\{ id: \`koinonia_\$\{doc\.id\}\`, \.\.\.docData, category: 'koinonia', date: dateStr \}\);\s*\}\);/,
    `koinoniaSnapshot.forEach((doc) => {
                const docData = doc.data();
                let dateStr = docData.date;
                if (!dateStr && docData.createdAt) {
                    const d = docData.createdAt.toDate();
                    dateStr = \`\${d.getFullYear()}. \${String(d.getMonth() + 1).padStart(2, '0')}. \${String(d.getDate()).padStart(2, '0')}.\`;
                }
                data.push({ id: \`koinonia_\${doc.id}\`, ...docData, category: 'koinonia', date: dateStr });
            });
            networkSnapshot.forEach((doc) => {
                const docData = doc.data();
                data.push({ id: \`network_\${doc.id}\`, ...docData, category: 'network' });
            });`
);

// 4. Update BoardGrid mapping for meta
content = content.replace(
    /let displayDate = '';\s*const dateStr = post\.originalDate \|\| post\.date \|\| '';\s*const parts = dateStr\.split\(\/\[\^\\d\]\+\/\)\.filter\(Boolean\);\s*if \(parts\.length >= 3\) \{\s*displayDate = \`\$\{parts\[0\]\}\.\$\{String\(parseInt\(parts\[1\], 10\)\)\.padStart\(2, '0'\)\}\.\$\{String\(parseInt\(parts\[2\], 10\)\)\.padStart\(2, '0'\)\}\`;\s*\} else \{\s*displayDate = dateStr;\s*\}/,
    `let displayDate = '';
                            if (post.category === 'network') {
                                displayDate = post.author === '관리자' ? '정보 확인 필요' : post.author;
                            } else {
                                const dateStr = post.originalDate || post.date || '';
                                const parts = dateStr.split(/[^\\d]+/).filter(Boolean);
                                if (parts.length >= 3) {
                                    displayDate = \`\${parts[0]}.\${String(parseInt(parts[1], 10)).padStart(2, '0')}.\${String(parseInt(parts[2], 10)).padStart(2, '0')}\`;
                                } else {
                                    displayDate = dateStr;
                                }
                            }`
);

fs.writeFileSync('src/pages/NewsPage.jsx', content);
console.log('Updated NewsPage.jsx');
