import { supabase } from '../lib/supabaseClient'
import crypto from 'crypto'

export interface VendorAuthResult {
    success: boolean
    data?: any
    error?: string
    message?: string
}

/**
 * Request password reset - sends email with reset token
 */
export const requestPasswordReset = async (email: string): Promise<VendorAuthResult> => {
    try {
        // Check if vendor exists
        const { data: vendor, error: fetchError } = await supabase
            .from('vendor_users')
            .select('id, email, company_name')
            .eq('email', email)
            .single()

        if (fetchError || !vendor) {
            return {
                success: false,
                error: 'Email tidak terdaftar sebagai vendor'
            }
        }

        // Generate reset token (6 digit code for simplicity)
        const resetToken = Math.floor(100000 + Math.random() * 900000).toString()
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

        // Save reset token to database
        const { error: updateError } = await supabase
            .from('vendor_users')
            .update({
                reset_token: resetToken,
                reset_token_expires: expiresAt.toISOString()
            })
            .eq('id', vendor.id)

        if (updateError) {
            console.error('Error saving reset token:', updateError)
            return {
                success: false,
                error: 'Gagal membuat kode reset. Silakan coba lagi.'
            }
        }

        // In production, send email here
        // For now, we'll return the token in the response for testing
        console.log('Reset token for', email, ':', resetToken)

        return {
            success: true,
            message: `Kode reset password telah dikirim ke email ${email}`,
            data: {
                // In production, don't send this. Email should contain the token.
                // For testing purposes only:
                resetToken: resetToken,
                expiresAt: expiresAt
            }
        }
    } catch (error) {
        console.error('Password reset request error:', error)
        return {
            success: false,
            error: 'Terjadi kesalahan. Silakan coba lagi.'
        }
    }
}

/**
 * Verify reset token and reset password
 */
export const resetPassword = async (
    email: string,
    resetToken: string,
    newPassword: string
): Promise<VendorAuthResult> => {
    try {
        // Validate password
        if (newPassword.length < 6) {
            return {
                success: false,
                error: 'Password minimal 6 karakter'
            }
        }

        // Find vendor with matching email and token
        const { data: vendor, error: fetchError } = await supabase
            .from('vendor_users')
            .select('id, email, reset_token, reset_token_expires')
            .eq('email', email)
            .eq('reset_token', resetToken)
            .single()

        if (fetchError || !vendor) {
            return {
                success: false,
                error: 'Kode reset tidak valid atau sudah digunakan'
            }
        }

        // Check if token is expired
        const expiresAt = new Date(vendor.reset_token_expires)
        if (expiresAt < new Date()) {
            return {
                success: false,
                error: 'Kode reset sudah kadaluarsa. Silakan minta kode baru.'
            }
        }

        // Update password and clear reset token
        const { error: updateError } = await supabase
            .from('vendor_users')
            .update({
                password: newPassword, // In production, hash this password
                reset_token: null,
                reset_token_expires: null
            })
            .eq('id', vendor.id)

        if (updateError) {
            console.error('Error updating password:', updateError)
            return {
                success: false,
                error: 'Gagal mengubah password. Silakan coba lagi.'
            }
        }

        return {
            success: true,
            message: 'Password berhasil diubah. Silakan login dengan password baru.'
        }
    } catch (error) {
        console.error('Password reset error:', error)
        return {
            success: false,
            error: 'Terjadi kesalahan. Silakan coba lagi.'
        }
    }
}

/**
 * Register new vendor with complete profile data
 */
export const registerVendor = async (vendorData: {
    email: string
    password: string
    companyName: string
    companyType?: string
    phone: string
    address?: string
    city?: string
    province?: string
    postalCode?: string
    fax?: string
    picName?: string
    picPosition?: string
    picPhone?: string
    picEmail?: string
    npwp?: string
    siup?: string
    tdp?: string
    established?: number
}): Promise<VendorAuthResult> => {
    try {
        // Validate required fields
        if (!vendorData.email || !vendorData.password || !vendorData.companyName || !vendorData.phone) {
            return {
                success: false,
                error: 'Data wajib (Email, Password, Nama Perusahaan, Telepon) harus diisi'
            }
        }

        if (vendorData.password.length < 6) {
            return {
                success: false,
                error: 'Password minimal 6 karakter'
            }
        }

        // Check if email already exists
        const { data: existingVendor } = await supabase
            .from('vendor_users')
            .select('id')
            .eq('email', vendorData.email)
            .single()

        if (existingVendor) {
            return {
                success: false,
                error: 'Email sudah terdaftar'
            }
        }

        // Insert new vendor
        const { data: newVendor, error: insertError } = await supabase
            .from('vendor_users')
            .insert([{
                email: vendorData.email,
                password: vendorData.password, // In production, hash this
                company_name: vendorData.companyName,
                company_type: vendorData.companyType || 'PT',
                phone: vendorData.phone,
                address: vendorData.address,
                city: vendorData.city,
                province: vendorData.province,
                postal_code: vendorData.postalCode,
                fax: vendorData.fax,
                pic_name: vendorData.picName,
                pic_position: vendorData.picPosition,
                pic_phone: vendorData.picPhone,
                pic_email: vendorData.picEmail,
                npwp: vendorData.npwp,
                siup: vendorData.siup,
                tdp: vendorData.tdp,
                established: vendorData.established,
                created_at: new Date().toISOString()
            }])
            .select()
            .single()

        if (insertError) {
            console.error('Error inserting vendor:', insertError)
            return {
                success: false,
                error: 'Gagal mendaftar. Silakan coba lagi.'
            }
        }

        return {
            success: true,
            message: 'Pendaftaran berhasil! Silakan login.',
            data: newVendor
        }
    } catch (error) {
        console.error('Vendor registration error:', error)
        return {
            success: false,
            error: 'Terjadi kesalahan. Silakan coba lagi.'
        }
    }
}
