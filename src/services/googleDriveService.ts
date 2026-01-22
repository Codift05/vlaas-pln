import { google } from 'googleapis';
import { Readable } from 'stream';
import path from 'path';
import fs from 'fs';

// Path ke OAuth2 credentials (BUKAN service account!)
const CREDENTIALS_PATH = path.join(
    process.cwd(),
    'src',
    'services',
    'server',
    'credentials.json'
);

const TOKEN_PATH = path.join(
    process.cwd(),
    'src',
    'services',
    'server',
    'token.json'
);

// Konstanta nama folder
const ROOT_FOLDER_NAME = 'Berkas Kontrak';
// ID folder Google Drive Anda
const ROOT_FOLDER_ID = '15qEM_lIuA09Mm63h9kGKG9VzfWyLVcSI';
const SCOPES = ['https://www.googleapis.com/auth/drive'];

/**
 * Inisialisasi Google Drive client dengan OAuth2
 */
export function getDriveClient() {
    try {
        // Check if files exist
        if (!fs.existsSync(CREDENTIALS_PATH)) {
            throw new Error(
                'credentials.json not found! Please download OAuth2 credentials from Google Cloud Console.\n' +
                'See OAUTH2_SETUP_GUIDE.md for instructions.'
            );
        }

        if (!fs.existsSync(TOKEN_PATH)) {
            throw new Error(
                'token.json not found! Please run: node scripts/generate-drive-token.js\n' +
                'See OAUTH2_SETUP_GUIDE.md for instructions.'
            );
        }

        // Load credentials
        const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
        const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

        // Create OAuth2 client
        const oAuth2Client = new google.auth.OAuth2(
            client_id,
            client_secret,
            redirect_uris[0]
        );

        // Load token
        const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
        oAuth2Client.setCredentials(token);

        const drive = google.drive({ version: 'v3', auth: oAuth2Client });
        return drive;
    } catch (error: any) {
        console.error('Error initializing Google Drive client:', error);
        throw new Error('Failed to initialize Google Drive client: ' + error.message);
    }
}

/**
 * Mencari folder berdasarkan nama dan parent folder ID
 */
export async function findFolderByName(
    folderName: string,
    parentFolderId?: string
): Promise<string | null> {
    const drive = getDriveClient();

    try {
        let query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

        if (parentFolderId) {
            query += ` and '${parentFolderId}' in parents`;
        }

        const response = await drive.files.list({
            q: query,
            fields: 'files(id, name)',
            spaces: 'drive',
        });

        const folders = response.data.files;

        if (folders && folders.length > 0) {
            return folders[0].id || null;
        }

        return null;
    } catch (error) {
        console.error('Error finding folder:', error);
        throw new Error(`Failed to find folder: ${folderName}`);
    }
}

/**
 * Membuat folder baru di Google Drive
 */
export async function createFolder(
    folderName: string,
    parentFolderId?: string
): Promise<string> {
    const drive = getDriveClient();

    try {
        console.log(`Creating folder: ${folderName}`, { parentFolderId });

        const fileMetadata: any = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
        };

        if (parentFolderId) {
            fileMetadata.parents = [parentFolderId];
        }

        const response = await drive.files.create({
            requestBody: fileMetadata,
            fields: 'id',
        });

        const folderId = response.data.id;

        if (!folderId) {
            throw new Error('Failed to get folder ID after creation');
        }

        console.log(`Folder created: ${folderName} (ID: ${folderId})`);
        return folderId;
    } catch (error: any) {
        console.error('Error creating folder:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            folderName,
            parentFolderId
        });

        let errorMessage = `Failed to create folder: ${folderName}`;

        if (error.code === 403) {
            errorMessage += '\n\n PERMISSION DENIED!\n\nService account tidak punya akses untuk membuat folder di Google Drive.\n\nSolusi:\n1. Buka Google Drive\n2. Buat folder "Berkas Kontrak" secara manual\n3. Share folder tersebut dengan service account email\n4. Set permission ke "Editor" atau "Content Manager"';
        }

        throw new Error(errorMessage);
    }
}

/**
 * Mendapatkan atau membuat folder (jika belum ada)
 */
export async function getOrCreateFolder(
    folderName: string,
    parentFolderId?: string
): Promise<string> {
    // Cek apakah folder sudah ada
    let folderId = await findFolderByName(folderName, parentFolderId);

    // Jika belum ada, buat folder baru
    if (!folderId) {
        folderId = await createFolder(folderName, parentFolderId);
    }

    return folderId;
}

/**
 * Setup struktur folder untuk kontrak
 * Struktur: Berkas Kontrak > [AI/AO] > [Nama Kontrak]
 */
export async function setupContractFolderStructure(
    tipeAnggaran: 'AI' | 'AO',
    namaKontrak: string
): Promise<string> {
    try {
        // 1. Gunakan folder root yang sudah di-share (tidak perlu cari/buat baru)
        const rootFolderId = ROOT_FOLDER_ID;
        console.log(`Root folder ID: ${rootFolderId}`);

        // 2. Cari/buat folder tipe anggaran (AI/AO)
        const budgetFolderId = await getOrCreateFolder(tipeAnggaran, rootFolderId);
        console.log(`Budget folder (${tipeAnggaran}) ID: ${budgetFolderId}`);

        // 3. Cari/buat folder nama kontrak
        const contractFolderId = await getOrCreateFolder(namaKontrak, budgetFolderId);
        console.log(`Contract folder (${namaKontrak}) ID: ${contractFolderId}`);

        return contractFolderId;
    } catch (error) {
        console.error('Error setting up folder structure:', error);
        throw new Error('Failed to setup contract folder structure');
    }
}

/**
 * Upload file ke Google Drive
 */
export async function uploadFileToDrive(
    file: Buffer,
    fileName: string,
    mimeType: string,
    folderId: string
): Promise<{ fileId: string; webViewLink: string }> {
    const drive = getDriveClient();

    try {
        console.log(`Uploading file to Drive:`, {
            fileName,
            mimeType,
            folderId,
            fileSize: file.length
        });

        const fileMetadata = {
            name: fileName,
            parents: [folderId],
        };

        // Konversi Buffer ke Stream
        const bufferStream = new Readable();
        bufferStream.push(file);
        bufferStream.push(null);

        const media = {
            mimeType: mimeType,
            body: bufferStream,
        };

        console.log('Calling Google Drive API...');

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, webViewLink',
        });

        console.log('Google Drive API response:', response.data);

        const fileId = response.data.id;
        const webViewLink = response.data.webViewLink;

        if (!fileId || !webViewLink) {
            throw new Error('Failed to get file information after upload');
        }

        console.log(`File uploaded: ${fileName} (ID: ${fileId})`);

        return {
            fileId,
            webViewLink,
        };
    } catch (error: any) {
        console.error('Error uploading file:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            errors: error.errors,
            response: error.response?.data
        });

        // More detailed error message
        let errorMessage = `Failed to upload file: ${fileName}`;

        if (error.code === 403) {
            errorMessage += '\n\n⚠️ PERMISSION DENIED!\n\nService account tidak punya akses ke folder Google Drive.\n\nCara mengatasi:\n1. Buka Google Drive\n2. Cari folder "Berkas Kontrak"\n3. Klik kanan > Share\n4. Tambahkan email service account (lihat di file JSON)\n5. Set permission ke "Editor"';
        } else if (error.code === 404) {
            errorMessage += `\n\n⚠️ Folder tidak ditemukan! Folder ID: ${folderId}`;
        } else if (error.message) {
            errorMessage += `\n\nDetail: ${error.message}`;
        }

        throw new Error(errorMessage);
    }
}

/**
 * Fungsi utama untuk upload kontrak PDF
 */
export async function uploadContractPDF(
    file: Buffer,
    fileName: string,
    tipeAnggaran: 'AI' | 'AO',
    namaKontrak: string
): Promise<{ fileId: string; webViewLink: string; folderPath: string }> {
    try {
        // Setup struktur folder: Berkas Kontrak > AI/AO > Nama Kontrak
        const contractFolderId = await setupContractFolderStructure(tipeAnggaran, namaKontrak);

        // Upload file ke folder yang sesuai
        const uploadResult = await uploadFileToDrive(
            file,
            fileName,
            'application/pdf',
            contractFolderId
        );

        const folderPath = `Berkas Kontrak/${tipeAnggaran}/${namaKontrak}`;

        return {
            ...uploadResult,
            folderPath,
        };
    } catch (error) {
        console.error('Error in uploadContractPDF:', error);
        throw error;
    }
}

/**
 * Menghapus file dari Google Drive
 */
export async function deleteFileFromDrive(fileId: string): Promise<void> {
    const drive = getDriveClient();

    try {
        await drive.files.delete({
            fileId: fileId,
        });

        console.log(`File deleted: ${fileId}`);
    } catch (error) {
        console.error('Error deleting file:', error);
        throw new Error(`Failed to delete file: ${fileId}`);
    }
}

/**
 * Mendapatkan informasi file dari Google Drive
 */
export async function getFileInfo(fileId: string) {
    const drive = getDriveClient();

    try {
        const response = await drive.files.get({
            fileId: fileId,
            fields: 'id, name, mimeType, size, createdTime, modifiedTime, webViewLink',
        });

        return response.data;
    } catch (error) {
        console.error('Error getting file info:', error);
        throw new Error(`Failed to get file info: ${fileId}`);
    }
}
