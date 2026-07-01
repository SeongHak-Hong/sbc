import axios from 'axios';
import https from 'https';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function run() {
    try {
        const url = 'https://shintanjin.hompee.org/servlet/ImageView?img=1772184728753.png&dir=image&div=60771';
        console.log('Fetching', url);
        const res = await axios.get(url, {
            httpsAgent,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
                'Referer': 'https://shintanjin.hompee.org/user/bbs/general/view'
            }
        });
        console.log('Status:', res.status);
    } catch (e) {
        console.error('Error status:', e.response?.status);
    }
}
run();
