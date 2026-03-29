import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// Menggunakan anon key karena SUPABASE_SERVICE_ROLE_KEY di .env untuk project berbeda
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
)

function generateActivationToken(): string {
    return crypto.randomBytes(32).toString('hex')
}

export async function POST(request: NextRequest) {
    try {
        const { email, companyName, vendorName, invitedBy } = await request.json()

        if (!email) {
            return NextResponse.json(
                { success: false, error: 'Email harus diisi' },
                { status: 400 }
            )
        }

        const adminName = invitedBy || 'Admin PLN'
        const nameToUse = companyName || vendorName || 'Vendor'

        // 1. Generate new activation token
        const activationToken = generateActivationToken()
        const tokenExpires = new Date()
        tokenExpires.setDate(tokenExpires.getDate() + 7) // 7 hari

        console.log('🔄 [resend-invitation] Processing for:', email, {
            tokenPreview: activationToken.substring(0, 10) + '...',
            expires: tokenExpires.toISOString()
        })

        // 2. Check if vendor_user exists with this email (using admin client to bypass RLS)
        const { data: existingVendorUser, error: findError } = await supabaseAdmin
            .from('vendor_users')
            .select('id')
            .eq('email', email)
            .maybeSingle()

        if (findError) {
            console.error('❌ Error finding vendor_user:', findError)
            return NextResponse.json(
                { success: false, error: 'Gagal memeriksa data vendor: ' + findError.message },
                { status: 500 }
            )
        }

        if (existingVendorUser) {
            // 3a. Update existing vendor_user with new token
            const { error: updateError } = await supabaseAdmin
                .from('vendor_users')
                .update({
                    company_name: nameToUse,
                    activation_token: activationToken,
                    activation_token_expires: tokenExpires.toISOString(),
                    invited_by: adminName,
                    is_activated: false,
                    status: 'Menunggu Aktivasi'
                })
                .eq('id', existingVendorUser.id)

            if (updateError) {
                console.error('❌ Error updating vendor_user:', updateError)
                return NextResponse.json(
                    { success: false, error: 'Gagal memperbarui token aktivasi: ' + updateError.message },
                    { status: 500 }
                )
            }
            console.log('✅ vendor_user token updated:', existingVendorUser.id)
        } else {
            // 3b. Create new vendor_user
            const tempPassword = 'TEMP_PENDING_ACTIVATION_' + Date.now()
            const { error: insertError } = await supabaseAdmin
                .from('vendor_users')
                .insert([{
                    email: email,
                    password: tempPassword,
                    company_name: nameToUse,
                    pic_email: email,
                    activation_token: activationToken,
                    activation_token_expires: tokenExpires.toISOString(),
                    invited_by: adminName,
                    is_activated: false,
                    status: 'Menunggu Aktivasi'
                }])

            if (insertError) {
                console.error('❌ Error creating vendor_user:', insertError)
                return NextResponse.json(
                    { success: false, error: 'Gagal membuat akun vendor: ' + insertError.message },
                    { status: 500 }
                )
            }
            console.log('✅ vendor_user created for:', email)
        }

        // 4. Send invitation email
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
            process.env.NEXTAUTH_URL ||
            `${request.nextUrl.protocol}//${request.nextUrl.host}`

        const activationLink = `${baseUrl}/vendor-activate?token=${activationToken}`

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        })

        const mailOptions = {
            from: `"SAKTI PLN - Undangan Vendor" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: 'Undangan Bergabung sebagai Vendor - SAKTI PLN',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
                        .container { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: white; padding: 40px 30px; text-align: center; }
                        .logo { font-size: 36px; font-weight: bold; margin-bottom: 10px; }
                        .content { padding: 40px 30px; }
                        .welcome-text { font-size: 24px; font-weight: 600; color: #1e293b; margin-bottom: 20px; }
                        .company-name { color: #0284c7; }
                        .invitation-box { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #0284c7; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
                        .activate-btn { display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: white !important; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; }
                        .steps { background: #f8fafc; border-radius: 12px; padding: 25px; margin: 30px 0; }
                        .step { display: flex; align-items: flex-start; margin-bottom: 12px; }
                        .step-number { background: #0284c7; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 12px; flex-shrink: 0; }
                        .info-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px 20px; margin: 25px 0; border-radius: 0 8px 8px 0; }
                        .link-text { background: #f1f5f9; padding: 15px; border-radius: 8px; font-size: 12px; word-break: break-all; color: #64748b; margin-top: 20px; }
                        .footer { background: #f8fafc; padding: 25px 30px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
                        .warning { color: #dc2626; font-weight: 500; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo">⚡ SAKTI PLN</div>
                            <p>Sistem Arsip &amp; Kontrak Terintegrasi</p>
                        </div>
                        <div class="content">
                            <div class="welcome-text">Selamat Datang, <span class="company-name">${nameToUse}!</span></div>
                            <p>Anda telah diundang oleh <strong>${adminName}</strong> untuk bergabung sebagai vendor di sistem SAKTI PLN.</p>
                            <div class="invitation-box">
                                <p>Klik tombol di bawah ini untuk mengaktifkan akun Anda dan membuat password:</p>
                                <a href="${activationLink}" class="activate-btn">🚀 Aktifkan Akun Saya</a>
                            </div>
                            <div class="steps">
                                <div style="font-weight:600;margin-bottom:15px;">📋 Langkah Aktivasi:</div>
                                <div class="step"><div class="step-number">1</div><div>Klik tombol "Aktifkan Akun Saya" di atas</div></div>
                                <div class="step"><div class="step-number">2</div><div>Buat password yang kuat untuk akun Anda</div></div>
                                <div class="step"><div class="step-number">3</div><div>Login ke portal vendor dengan email dan password baru</div></div>
                            </div>
                            <div class="info-box">
                                <strong>⏰ Penting:</strong>
                                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                                    <li>Link aktivasi ini berlaku selama <strong>7 hari</strong></li>
                                    <li>Jangan bagikan link ini kepada siapa pun</li>
                                    <li>Jika link kadaluarsa, hubungi admin PLN untuk mengirim ulang undangan</li>
                                </ul>
                            </div>
                            <p class="warning">⚠️ Jika Anda tidak merasa mendaftar sebagai vendor PLN, harap abaikan email ini.</p>
                            <div class="link-text"><strong>Link aktivasi:</strong><br>${activationLink}</div>
                        </div>
                        <div class="footer">
                            <p><strong>PLN SAKTI - Vendor Portal</strong></p>
                            <p>Email ini dikirim secara otomatis. Mohon tidak membalas email ini.</p>
                            <p>© ${new Date().getFullYear()} PT PLN (Persero). All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        }

        await transporter.sendMail(mailOptions)
        console.log('✅ Invitation email sent to:', email)

        return NextResponse.json({
            success: true,
            message: `Email undangan berhasil dikirim ke ${email}`
        })

    } catch (error) {
        console.error('❌ Error in resend-invitation:', error)
        return NextResponse.json({
            success: false,
            error: 'Gagal memproses undangan. Silakan coba lagi.',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
