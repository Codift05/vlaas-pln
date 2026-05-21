
require('dotenv').config({ path: '.env.local' });
const https = require('https');

const token = process.env.TELEGRAM_BOT_TOKEN;
const webhookUrl = 'https://49b9-2404-c0-4969-5f13-4c21-85c0-ae62-45db.ngrok-free.app/api/telegram/webhook';

if (!token) {
    console.error('Error: TELEGRAM_BOT_TOKEN not found');
    process.exit(1);
}

const url = `https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('Response:', data);
    });
}).on('error', err => {
    console.error('Error:', err.message);
});
