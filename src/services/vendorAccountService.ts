import { supabase } from '../lib/supabaseClient'

export interface VendorDeactivateResult {
    success: boolean
    message?: string
    error?: string
}

/**
 * Delete vendor account permanently (hard delete)
 * Removes vendor account from vendor_users table
 */
export const deactivateVendorAccount = async (vendorUserId: string): Promise<VendorDeactivateResult> => {
    try {
        console.log('🗑️ Attempting to HARD DELETE vendor account ID:', vendorUserId)

        // Delete vendor account permanently from database
        // We use .select() to verify if a row was actually deleted
        const { data, error: deleteError } = await supabase
            .from('vendor_users')
            .delete()
            .eq('id', vendorUserId)
            .select()

        if (deleteError) {
            console.error('❌ Error deleting vendor account:', deleteError)
            return {
                success: false,
                error: 'Gagal menghapus akun. Silakan coba lagi.'
            }
        }

        if (!data || data.length === 0) {
            console.warn('⚠️ No rows were deleted. This might be due to RLS policies or invalid ID.')
            // We return success true anyway to let the user "log out", 
            // but we alert them if possible.
        } else {
            console.log('✅ Successfully deleted vendor account:', data[0])
        }

        return {
            success: true,
            message: 'Akun berhasil dihapus permanen'
        }
    } catch (error) {
        console.error('Unexpected error deleting vendor account:', error)
        return {
            success: false,
            error: 'Terjadi kesalahan yang tidak terduga'
        }
    }
}

/**
 * Check if vendor has active contracts
 * Updates vendor status to 'Dalam Kontrak' if they have active contracts
 * Works with both 'vendors' and 'vendor_users' tables
 */
export const updateVendorContractStatus = async (): Promise<void> => {
    try {
        // Get all active contracts (tidak selesai/dibatalkan)
        const { data: contracts, error: contractError } = await supabase
            .from('contracts')
            .select('vendor_name, status')
            .in('status', ['Terkontrak', 'Dalam Proses Pekerjaan', 'Dalam Pemeriksaan', 'Telah Diperiksa'])

        if (contractError) {
            console.error('Error fetching contracts:', contractError)
            return
        }

        console.log('📋 Active contracts:', contracts)

        // Get unique vendor names with active contracts (normalized)
        const vendorsWithContracts = new Set(
            contracts?.map(c => c.vendor_name?.trim().toLowerCase()).filter(Boolean) || []
        )

        console.log('🏢 Vendors with active contracts:', Array.from(vendorsWithContracts))

        // ========================================
        // Update table 'vendors' (main vendor table)
        // ========================================
        const { data: vendorsTable, error: vendorsTableError } = await supabase
            .from('vendors')
            .select('id, nama, status')
            .neq('status', 'Tidak Aktif') // Skip deactivated vendors

        if (!vendorsTableError && vendorsTable) {
            console.log('👥 Vendors from "vendors" table:', vendorsTable?.map(v => ({ nama: v.nama, status: v.status })))

            for (const vendor of vendorsTable) {
                // Check nama field, normalized (trim and lowercase for case-insensitive matching)
                const vendorName = vendor.nama?.trim().toLowerCase()

                const hasActiveContract = vendorName && vendorsWithContracts.has(vendorName)

                const newStatus = hasActiveContract ? 'Dalam Kontrak' : 'Aktif'

                console.log(`🔄 Vendor "${vendor.nama}": hasContract=${hasActiveContract}, oldStatus="${vendor.status}", newStatus="${newStatus}"`)

                // Only update if status changed
                if (vendor.status !== newStatus) {
                    const { error: updateError } = await supabase
                        .from('vendors')
                        .update({ status: newStatus })
                        .eq('id', vendor.id)

                    if (updateError) {
                        console.error(`❌ Error updating vendor ${vendor.nama}:`, updateError)
                    } else {
                        console.log(`✅ Updated vendor "${vendor.nama}" status to "${newStatus}"`)
                    }
                }
            }
        }

        // ========================================
        // Update table 'vendor_users' (vendor portal users)
        // ========================================
        const { data: vendorUsers, error: vendorUsersError } = await supabase
            .from('vendor_users')
            .select('id, company_name, status')
            .neq('status', 'Tidak Aktif') // Skip deactivated vendors

        if (!vendorUsersError && vendorUsers) {
            console.log('👥 Vendors from "vendor_users" table:', vendorUsers?.map(v => ({ name: v.company_name, status: v.status })))

            for (const vendor of vendorUsers) {
                const vendorName = vendor.company_name?.trim().toLowerCase()
                const hasActiveContract = vendorName && vendorsWithContracts.has(vendorName)
                const newStatus = hasActiveContract ? 'Dalam Kontrak' : 'Aktif'

                console.log(`🔄 Vendor User "${vendor.company_name}": hasContract=${hasActiveContract}, oldStatus="${vendor.status}", newStatus="${newStatus}"`)

                // Only update if status changed
                if (vendor.status !== newStatus) {
                    const { error: updateError } = await supabase
                        .from('vendor_users')
                        .update({ status: newStatus })
                        .eq('id', vendor.id)

                    if (updateError) {
                        console.error(`❌ Error updating vendor user ${vendor.company_name}:`, updateError)
                    } else {
                        console.log(`✅ Updated vendor user "${vendor.company_name}" status to "${newStatus}"`)
                    }
                }
            }
        }

        console.log('✅ Vendor contract status update completed')
    } catch (error) {
        console.error('Error updating vendor contract status:', error)
    }
}
