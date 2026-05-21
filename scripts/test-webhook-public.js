
const https = require('https');

// URL from ngrok output
const url = 'https://49b9-2404-c0-4969-5f13-4c21-85c0-ae62-45db.ngrok-free.app/api/telegram/webhook';

const data = JSON.stringify({
    update_id: 123456789,
    message: {
        message_id: 1,
        from: {
            id: 12345,
            is_bot: false,
            first_name: "TestPublic",
            username: "testpublic"
        },
        chat: {
            id: 12345,
            first_name: "TestPublic",
            username: "testpublic",
            type: "private"
        },
        date: 1678900000,
        text: "/stats"
    }
});

const req = https.request(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
}, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
    res.on('end', () => {
        console.log('No more data in response.');
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
