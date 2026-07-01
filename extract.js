import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import https from 'https';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function run() {
    const url = 'https://shintanjin.hompee.org/user/bbs/general/view?menuId=10010387&bbsNo=283775';
    const res = await axios.get(url, { httpsAgent, responseType: 'arraybuffer' });
    // Convert to string assuming utf-8
    const html = res.data.toString('utf-8');
    const $ = cheerio.load(html);
    
    // We want the element containing the title and content
    // Usually title is in a td like td background="...tit_bg.png"
    const title = $('b:contains("ILLO Life")').text() || $('td:contains("ILLO Life")').text().trim();
    
    // Look for content
    const contentHtml = $('#printContent').html() || $('td[valign="top"]').filter((i, el) => $(el).html().includes('<img') || $(el).text().includes('ILLO')).html();
    
    fs.writeFileSync('extracted.json', JSON.stringify({ title, contentHtml }, null, 2));
    console.log('Saved to extracted.json');
}
run();
