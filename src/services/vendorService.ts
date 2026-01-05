import { supabase, handleSupabaseError, handleSupabaseSuccess } from '../lib/supabaseClient';

/**
 * Vendor Service
 * CRUD operations untuk data vendor
 */

// Get all vendors
export const getAllVendors = async () => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return handleSupabaseError(error);

    return handleSupabaseSuccess(data);
  } catch (error) {
    return handleSupabaseError(error);
  }
};

// Optimized for Dashboard: Get count and recent vendors
export const getDashboardVendorData = async () => {
  try {
    // 1. Get Total Count
    const { count, error: countError } = await supabase
      .from('vendors')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    // 2. Get Recent 5 Vendors (Reduced columns)
    const { data: recent, error: listError } = await supabase
      .from('vendors')
      .select('id, nama, email, kategori, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (listError) throw listError;

    return handleSupabaseSuccess({ total: count, recent });
  } catch (error) {
    return handleSupabaseError(error);
  }
};

// Get vendor by ID
export const getVendorById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return handleSupabaseError(error);

    return handleSupabaseSuccess(data);
  } catch (error) {
    return handleSupabaseError(error);
  }
};

// Create new vendor
export const createVendor = async (vendorData) => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .insert([vendorData])
      .select()
      .single();

    if (error) return handleSupabaseError(error);

    return handleSupabaseSuccess(data);
  } catch (error) {
    return handleSupabaseError(error);
  }
};

// Update vendor
export const updateVendor = async (id, vendorData) => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .update(vendorData)
      .eq('id', id)
      .select()
      .single();

    if (error) return handleSupabaseError(error);

    return handleSupabaseSuccess(data);
  } catch (error) {
    return handleSupabaseError(error);
  }
};

// Delete vendor
export const deleteVendor = async (id) => {
  try {
    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', id);

    if (error) return handleSupabaseError(error);

    return handleSupabaseSuccess({ message: 'Vendor berhasil dihapus' });
  } catch (error) {
    return handleSupabaseError(error);
  }
};

// Search vendors
export const searchVendors = async (searchTerm) => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .or(`nama.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,kategori.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) return handleSupabaseError(error);

    return handleSupabaseSuccess(data);
  } catch (error) {
    return handleSupabaseError(error);
  }
};

// Filter vendors by status
export const filterVendorsByStatus = async (status) => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) return handleSupabaseError(error);

    return handleSupabaseSuccess(data);
  } catch (error) {
    return handleSupabaseError(error);
  }
};
