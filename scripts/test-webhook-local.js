
const http = require('http');

const data = JSON.stringify({
    update_id: 123456789,
    message: {
        message_id: 1,
        from: {
            id: 12345,
            is_bot: false,
            first_name: "Test",
            username: "testuser"
        },
        chat: {
            id: 12345,
            first_name: "Test",
            username: "testuser",
            type: "private"
        },
        date: 1678900000,
        text: "/stats"
    }
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/telegram/webhook',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
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

// Write data to request body
req.write(data);
req.end();
