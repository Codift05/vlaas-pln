import { supabase, handleSupabaseError, handleSupabaseSuccess, SupabaseResponse } from '../lib/supabaseClient';
import { deleteFileFromSupabase } from './fileUploadService';

export interface SuratPengajuan {
    id: string;
    nomor_surat: string;
    perihal: string;
    tanggal_surat: string;
    nama_pekerjaan?: string;
    nomor_kontrak?: string;
    keterangan?: string;
    file_name: string;
    file_url: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    alasan_penolakan?: string;
    created_at: string;
    updated_at: string;
}

// Create new surat
export const createSurat = async (data: any): Promise<SupabaseResponse> => {
    try {
        // Get vendor info from localStorage
        const vendorUserId = localStorage.getItem('vendorUserId')
        const vendorEmail = localStorage.getItem('vendorEmail')

        if (!vendorUserId || !vendorEmail) {
            return handleSupabaseError({
                message: 'Sesi login tidak ditemukan. Silakan login ulang.'
            });
        }

        const { data: result, error } = await supabase
            .from('surat_pengajuan')
            .insert([{
                nomor_surat: data.nomorSurat,
                perihal: data.perihal,
                tanggal_surat: data.tanggalSurat,
                nama_pekerjaan: data.namaPekerjaan,
                nomor_kontrak: data.nomorKontrak,
                keterangan: data.keterangan,
                file_name: data.fileName,
                file_url: data.fileUrl,
                status: 'PENDING',
                vendor_id: parseInt(vendorUserId),
                vendor_email: vendorEmail
            }])
            .select()
            .single();

        if (error) return handleSupabaseError(error);

        return handleSupabaseSuccess(result, 'Surat berhasil diajukan');
    } catch (error) {
        return handleSupabaseError(error);
    }
};

// Get all surat (with optional filtering)
export const getAllSurat = async (statusFilter: string = 'distinguish'): Promise<SupabaseResponse<SuratPengajuan[]>> => {
    try {
        let query = supabase
            .from('surat_pengajuan')
            .select('*')
            .order('created_at', { ascending: false });

        if (statusFilter !== 'ALL' && statusFilter !== 'distinguish') {
            query = query.eq('status', statusFilter);
        }

        const { data, error } = await query;

        if (error) {
            // If table doesn't exist, return empty array gracefully
            if (error.code === '42P01') {
                console.warn('Table surat_pengajuan does not exist yet.');
                return handleSupabaseSuccess([], 'Tabel belum dibuat');
            }
            return handleSupabaseError(error);
        }

        return handleSupabaseSuccess(data || []);
    } catch (error) {
        return handleSupabaseError(error);
    }
};

// Update surat status
export const updateSuratStatus = async (id: string, status: 'APPROVED' | 'REJECTED', reason?: string): Promise<SupabaseResponse> => {
    try {
        const updateData: any = {
            status,
            updated_at: new Date().toISOString()
        };

        if (reason) {
            updateData.alasan_penolakan = reason;
        }

        const { data, error } = await supabase
            .from('surat_pengajuan')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) return handleSupabaseError(error);

        return handleSupabaseSuccess(data, `Surat berhasil ${status === 'APPROVED' ? 'disetujui' : 'ditolak'}`);
    } catch (error) {
        return handleSupabaseError(error);
    }
};

// Get surat by ID
export const getSuratById = async (id: string): Promise<SupabaseResponse<SuratPengajuan>> => {
    try {
        const { data, error } = await supabase
            .from('surat_pengajuan')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return handleSupabaseError(error);

        return handleSupabaseSuccess(data);
    } catch (error) {
        return handleSupabaseError(error);
    }
};
// Cleanup expired files (older than 7 days)
export const cleanupExpiredSuratFiles = async (): Promise<SupabaseResponse<{ cleanedCount: number }>> => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const cutoffDate = sevenDaysAgo.toISOString();

        // Find files older than 7 days that still have a file_url (not null or 'EXPIRED')
        const { data: expiredFiles, error } = await supabase
            .from('surat_pengajuan')
            .select('id, file_url, file_name')
            .lt('created_at', cutoffDate)
            .neq('file_url', 'EXPIRED') // Skip already expired marks
            .not('file_url', 'is', null);

        if (error) return handleSupabaseError(error);

        if (!expiredFiles || expiredFiles.length === 0) {
            return handleSupabaseSuccess({ cleanedCount: 0 });
        }

        let cleanedCount = 0;

        for (const file of expiredFiles) {
            if (file.file_url && file.file_url.includes('supabase')) {
                // 1. Delete actual file from storage
                const deleteResult = await deleteFileFromSupabase(file.file_url);

                if (deleteResult.success) {
                    // 2. Mark record as expired in database
                    await supabase
                        .from('surat_pengajuan')
                        .update({
                            file_url: 'EXPIRED',
                            file_name: `[EXPIRED] ${file.file_name}`
                        })
                        .eq('id', file.id);

                    cleanedCount++;
                }
            }
        }

        return handleSupabaseSuccess({ cleanedCount }, `Berhasil membersihkan ${cleanedCount} file kadaluarsa`);
    } catch (error) {
        return handleSupabaseError(error);
    }
};
