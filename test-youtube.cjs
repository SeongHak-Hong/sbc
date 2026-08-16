const fs = require('fs');
const https = require('https');

const apiKey = 'AIzaSyBHiTBjQtbuJGHLIbr4laGrrjXuHBudzGg';
const channelId = 'UCj3wg1t2u2eiMQxWIgT2OeQ';
const uploadsPlaylistId = channelId.replace(/^UC/, 'UU');

const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=10&key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const json = JSON.parse(data);
        json.items.forEach((item, index) => {
            const rawTitle = item.snippet.title.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
            let desc = item.snippet.description || '';
            desc = desc.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
            
            let title = '';
            const descTitleMatch = desc.match(/["“](.*?)["”]/);
            if (descTitleMatch && descTitleMatch[1].trim() !== '') {
                title = descTitleMatch[1].trim();
            } else {
                let cleanTitle = rawTitle.replace(/\[.*?\]|\(.*?\)|<.*?>|【.*?】/g, '').trim();
                let titleParts = cleanTitle.split(/[-|｜:]/).map(s => s.trim()).filter(s => s);
                title = titleParts[0]; 
            }
            
            console.log(`Video ${index + 1}:`);
            console.log(`  Raw Title: ${rawTitle}`);
            console.log(`  Description prefix: ${desc.substring(0, 100).replace(/\n/g, ' ')}...`);
            console.log(`  Parsed Title: ${title}`);
            console.log('---------------------------');
        });
    });
});
