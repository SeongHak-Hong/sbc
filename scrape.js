import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import https from 'https';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const BASE_URL = 'https://shintanjin.hompee.org';
const MENU_ID = '10010387';
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'uploads', 'migration');
const OUTPUT_JSON = path.join(process.cwd(), 'src', 'migrationData.json');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function scrapePage(pageNow) {
    const url = `${BASE_URL}/user/bbs/general/index?menuId=${MENU_ID}&topMenuId=3&menuType=1&newmenuAt=1&pageNow=${pageNow}`;
    const res = await axios.get(url, { httpsAgent });
    const $ = cheerio.load(res.data);
    
    const posts = [];
    $('tr[bgcolor="#ffffff"], tr[bgcolor="#f4f6fd"]').each((i, el) => {
        const onclick = $(el).find('a[onclick^="goView"]').attr('onclick');
        if (onclick) {
            const match = onclick.match(/goView\(['"](\d+)['"]\)/);
            if (match) {
                const id = match[1];
                const title = $(el).find('a').text().trim();
                const author = $(el).find('td:nth-child(4)').text().trim();
                const date = $(el).find('td:nth-child(5)').text().trim();
                
                posts.push({ id, title, author, date });
            }
        }
    });
    return posts;
}

async function scrapePost(post) {
    const url = `${BASE_URL}/user/bbs/general/view`;
    const params = new URLSearchParams();
    params.append('menuId', MENU_ID);
    params.append('menuType', '1');
    params.append('newmenuAt', '1');
    params.append('bbsNo', post.id);
    
    const res = await axios.post(url, params, { httpsAgent });
    const $ = cheerio.load(res.data);
    
    let contentText = '';
    const imageUrls = [];
    
    $('img').each((i, el) => {
        let src = $(el).attr('src');
        if (src && (src.includes('ImageView') || src.includes('FileView'))) {
            src = src.replace(/&amp;/g, '&');
            // Exclude layout images
            if (!src.includes('1750215705170') && !src.includes('1767179911977') && !src.includes('1767184704337')) { 
                imageUrls.push(BASE_URL + src);
                // The text is usually near the image
                const text = $(el).closest('td').text().replace(/\s+/g, ' ').trim();
                // Filter out the header texts by checking length and keywords
                if (text.length > 5 && text.length < 500 && !text.includes('번호제목글쓴이날짜파일조회수')) {
                    contentText = text;
                }
            }
        }
    });

    const localImages = [];
    for (const imgUrl of imageUrls) {
        try {
            console.log(`  Downloading ${imgUrl}`);
            const imgRes = await axios.get(imgUrl, { httpsAgent, responseType: 'arraybuffer' });
            
            const filename = `post_${post.id}_${Date.now()}.webp`;
            const filepath = path.join(OUTPUT_DIR, filename);
            
            await sharp(imgRes.data)
                .webp({ quality: 80 })
                .toFile(filepath);
                
            localImages.push(`/uploads/migration/${filename}`);
        } catch (err) {
            console.error(`  Failed to download/convert image: ${imgUrl}`, err.message);
        }
    }
    
    return {
        ...post,
        content: contentText,
        images: localImages
    };
}

async function run() {
    let allPosts = [];
    for (let page = 1; page <= 2; page++) {
        console.log(`Scraping page ${page}...`);
        const posts = await scrapePage(page);
        allPosts = allPosts.concat(posts);
    }
    
    console.log(`Found ${allPosts.length} posts. Scraping details...`);
    
    const results = [];
    for (const post of allPosts) {
        console.log(`Scraping post: ${post.title}`);
        const detailedPost = await scrapePost(post);
        results.push(detailedPost);
        await new Promise(r => setTimeout(r, 200));
    }
    
    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(results, null, 2));
    console.log(`Successfully saved ${results.length} posts to ${OUTPUT_JSON}`);
}

run();
