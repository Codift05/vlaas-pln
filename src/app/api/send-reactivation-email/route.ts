import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: Request) {
    try {
        const { email, code, companyName } = await request.json()

        if (!email || !code) {
            return NextResponse.json(
                { error: 'Email dan kode harus disediakan' },
                { status: 400 }
            )
        }

        // Create transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD
            }
        })

        // Email content
        const mailOptions = {
            from: `"VLAAS PLN" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Kode Reaktivasi Akun VLAAS PLN',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 30px;
                            text-align: center;
                            border-radius: 10px 10px 0 0;
                        }
                        .content {
                            background: #f9fafb;
                            padding: 30px;
                            border-radius: 0 0 10px 10px;
                        }
                        .code-box {
                            background: white;
                            border: 2px dashed #667eea;
                            border-radius: 8px;
                            padding: 20px;
                            text-align: center;
                            margin: 20px 0;
                        }
                        .code {
                            font-size: 32px;
                            font-weight: bold;
                            color: #667eea;
                            letter-spacing: 5px;
                        }
                        .warning {
                            background: #fef3c7;
                            border-left: 4px solid #f59e0b;
                            padding: 12px;
                            margin: 20px 0;
                            border-radius: 4px;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 20px;
                            color: #6b7280;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔓 Reaktivasi Akun</h1>
                            <p>VLAAS PLN - Vendor Portal</p>
                        </div>
                        <div class="content">
                            <p>Halo <strong>${companyName}</strong>,</p>
                            
                            <p>Anda telah meminta untuk mengaktifkan kembali akun vendor Anda. Gunakan kode berikut untuk melanjutkan proses reaktivasi:</p>
                            
                            <div class="code-box">
                                <div class="code">${code}</div>
                                <p style="margin-top: 10px; color: #6b7280;">Kode Reaktivasi</p>
                            </div>
                            
                            <div class="warning">
                                <strong>⚠️ Penting:</strong>
                                <ul style="margin: 10px 0; padding-left: 20px;">
                                    <li>Kode ini berlaku selama <strong>15 menit</strong></li>
                                    <li>Jangan bagikan kode ini kepada siapapun</li>
                                    <li>Jika Anda tidak meminta reaktivasi, abaikan email ini</li>
                                </ul>
                            </div>
                            
                            <p>Setelah akun diaktifkan kembali, Anda dapat login seperti biasa menggunakan email dan password Anda.</p>
                            
                            <p style="margin-top: 30px;">
                                Terima kasih,<br>
                                <strong>Tim VLAAS PLN</strong>
                            </p>
                        </div>
                        <div class="footer">
                            <p>Email ini dikirim secara otomatis. Mohon tidak membalas email ini.</p>
                            <p>&copy; 2026 VLAAS PLN. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        }

        // Send email
        await transporter.sendMail(mailOptions)

        return NextResponse.json({
            success: true,
            message: 'Email reaktivasi berhasil dikirim'
        })

    } catch (error) {
        console.error('Error sending reactivation email:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Gagal mengirim email',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}
