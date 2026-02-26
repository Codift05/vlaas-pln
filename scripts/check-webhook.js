
require('dotenv').config({ path: '.env.local' });
const https = require('https');

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
    console.error('Error: TELEGRAM_BOT_TOKEN not found in .env.local');
    process.exit(1);
}

const url = `https://api.telegram.org/bot${token}/getWebhookInfo`;

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            console.log(JSON.stringify(parsed, null, 2));
        } catch (e) {
            console.error('Error parsing response:', e);
            console.log(data);
        }
    });

}).on('error', (err) => {
    console.error('Error:', err.message);
});
