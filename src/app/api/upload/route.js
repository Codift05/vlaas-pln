import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { Readable } from 'stream';

const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
const TOKEN_PATH = path.join(process.cwd(), 'token.json');

function getDriveService() {
    let credentials;
    let token;

    // 1. Try Environment Variables
    if (process.env.GOOGLE_CREDENTIALS && process.env.GOOGLE_TOKEN) {
        try {
            credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
            token = JSON.parse(process.env.GOOGLE_TOKEN);
        } catch (e) {
            console.error('Error parsing credentials from environment variables:', e);
        }
    }

    // 2. Try Local Files if Env Vars failed or missing
    if (!credentials || !token) {
        if (fs.existsSync(CREDENTIALS_PATH) && fs.existsSync(TOKEN_PATH)) {
            credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
            token = JSON.parse(fs.readFileSync(TOKEN_PATH));
        } else {
            throw new Error('Google Drive credentials/token not found in environment variables or local files.');
        }
    }

    // Check structure: keys might be in 'installed' or 'web'
    const keys = credentials.installed || credentials.web;
    if (!keys) throw new Error('Invalid credentials format');

    const { client_secret, client_id, redirect_uris } = keys;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    oAuth2Client.setCredentials(token);
    return google.drive({ version: 'v3', auth: oAuth2Client });
}

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            throw new Error('No file uploaded.');
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const stream = Readable.from(buffer);

        const drive = getDriveService();

        const fileMetadata = {
            name: file.name,
        };

        const media = {
            mimeType: file.type,
            body: stream,
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, webViewLink, webContentLink',
        });

        return NextResponse.json({ success: true, file: response.data });
    } catch (err) {
        console.error('UPLOAD ERROR:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
