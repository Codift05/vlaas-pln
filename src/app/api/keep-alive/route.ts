import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Secret token untuk memproteksi endpoint ini dari akses publik
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
    // Verifikasi bahwa request datang dari Vercel Cron (atau request yang valid)
    const authHeader = request.headers.get('authorization');
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Lakukan query ringan ke Supabase untuk menjaga koneksi tetap aktif
        const { data, error } = await supabase
            .from('contracts')
            .select('id')
            .limit(1);

        if (error) {
            console.error('[Keep-Alive] Supabase query error:', error.message);
            return NextResponse.json(
                {
                    success: false,
                    message: 'Failed to ping Supabase',
                    error: error.message,
                    timestamp: new Date().toISOString(),
                },
                { status: 500 }
            );
        }

        console.log('[Keep-Alive] Supabase pinged successfully at', new Date().toISOString());

        return NextResponse.json({
            success: true,
            message: 'Supabase keep-alive ping successful',
            timestamp: new Date().toISOString(),
            rowsFetched: data?.length ?? 0,
        });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('[Keep-Alive] Unexpected error:', errorMessage);
        return NextResponse.json(
            {
                success: false,
                message: 'Unexpected error during keep-alive ping',
                error: errorMessage,
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}
