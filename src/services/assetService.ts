import { supabase, handleSupabaseError, handleSupabaseSuccess } from '../lib/supabaseClient';

/**
 * Asset Service
 * CRUD operations untuk data aset
 */

// Get all assets
export const getAllAssets = async () => {
  try {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return handleSupabaseError(error);
    
    return handleSupabaseSuccess(data);
  } catch (error) {
    return handleSupabaseError(error);
  }
};

// Get asset by ID
export const getAssetById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return handleSupabaseError(error);
    
    return handleSupabaseSuccess(data);
  } catch (error) {
    return handleSupabaseError(error);
  }
};

// Create new asset
export const createAsset = async (assetData) => {
  try {
    const { data, error } = await supabase
      .from('assets')
      .insert([assetData])
      .select()
      .single();

    if (error) return handleSupabaseError(error);
    
    return handleSupabaseSuccess(data);
  } catch (error) {
    return handleSupabaseError(error);
  }
};

// Update asset
export const updateAsset = async (id, assetData) => {
  try {
    const { data, error } = await supabase
      .from('assets')
      .update(assetData)
      .eq('id', id)
      .select()
      .single();

    if (error) return handleSupabaseError(error);
    
    return handleSupabaseSuccess(data);
  } catch (error) {
    return handleSupabaseError(error);
  }
};

// Delete asset
export const deleteAsset = async (id) => {
  try {
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id);

    if (error) return handleSupabaseError(error);
    
    return handleSupabaseSuccess({ message: 'Aset berhasil dihapus' });
  } catch (error) {
    return handleSupabaseError(error);
  }
};

// Search assets
export const searchAssets = async (searchTerm) => {
  try {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) return handleSupabaseError(error);
    
    return handleSupabaseSuccess(data);
  } catch (error) {
    return handleSupabaseError(error);
  }
};

// Filter assets by status
export const filterAssetsByStatus = async (status) => {
  try {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) return handleSupabaseError(error);
    
    return handleSupabaseSuccess(data);
  } catch (error) {
    return handleSupabaseError(error);
  }
};

// Get asset statistics
export const getAssetStatistics = async () => {
  try {
    const { data, error } = await supabase
      .from('assets')
      .select('status');

    if (error) return handleSupabaseError(error);

    // Count by status
    const stats = {
      total: data.length,
      aktif: data.filter(a => a.status === 'Aktif').length,
      perbaikan: data.filter(a => a.status === 'Perbaikan').length,
      tidakAktif: data.filter(a => a.status === 'Tidak Aktif').length
    };
    
    return handleSupabaseSuccess(stats);
  } catch (error) {
    return handleSupabaseError(error);
  }
};
