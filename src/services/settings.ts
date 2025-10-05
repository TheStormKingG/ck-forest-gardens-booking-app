import { supabase } from "../supabase-client";

export interface GeneralSettings {
  id?: string;
  contact_email?: string;
  phone_number?: string;
  physical_address?: string;
  deposit_instructions?: string;
}

export interface LogoSettings {
  id?: string;
  logo_url?: string;
  logo_data?: string;
}

export interface PasswordSettings {
  id?: string;
  user_id?: string;
  password_hash?: string;
}

// General Settings
export async function getGeneralSettings(): Promise<GeneralSettings | null> {
  const { data, error } = await supabase
    .from("general_settings")
    .select("*")
    .limit(1)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error fetching general settings from Supabase:', error);
    throw error;
  }
  
  console.log('General settings fetched from Supabase:', data);
  return data;
}

export async function upsertGeneralSettings(settings: GeneralSettings): Promise<GeneralSettings> {
  // First, delete all existing rows to ensure only one row exists
  const { error: deleteError } = await supabase
    .from("general_settings")
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
  
  if (deleteError) {
    console.error('Error deleting existing settings:', deleteError);
    throw deleteError;
  }
  
  // Then insert the new settings
  const { data, error } = await supabase
    .from("general_settings")
    .insert(settings)
    .select()
    .single();
  
  if (error) {
    console.error('Error inserting new settings:', error);
    throw error;
  }
  
  console.log('General settings updated:', data);
  return data;
}

// Logo Settings
export async function getLogoSettings(): Promise<LogoSettings | null> {
  const { data, error } = await supabase
    .from("logo_settings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching logo from Supabase:', error);
    throw error;
  }
  
  console.log('Logo fetched from Supabase:', data, 'at', new Date().toISOString());
  return data;
}

export async function upsertLogoSettings(settings: LogoSettings): Promise<LogoSettings> {
  // Try to get existing logo first
  const existing = await getLogoSettings();
  
  if (existing) {
    // Update existing logo
    console.log('Updating existing logo...');
    const { data, error } = await supabase
      .from("logo_settings")
      .update(settings)
      .eq('id', existing.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating logo:', error);
      throw error;
    }
    
    console.log('Logo updated:', data);
    return data;
  } else {
    // Insert new logo
    console.log('Inserting new logo...');
    const { data, error } = await supabase
      .from("logo_settings")
      .insert(settings)
      .select()
      .single();
    
    if (error) {
      console.error('Error inserting logo:', error);
      throw error;
    }
    
    console.log('New logo inserted:', data);
    return data;
  }
}

// Password Settings (for authenticated users)
export async function getPasswordSettings(): Promise<PasswordSettings | null> {
  const { data, error } = await supabase
    .from("password_settings")
    .select("*")
    .limit(1)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error fetching password settings from Supabase:', error);
    throw error;
  }
  
  console.log('Password settings fetched from Supabase:', data);
  return data;
}

export async function upsertPasswordSettings(passwordHash: string): Promise<PasswordSettings> {
  // First, delete all existing rows to ensure only one row exists
  const { error: deleteError } = await supabase
    .from("password_settings")
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
  
  if (deleteError) {
    console.error('Error deleting existing password settings:', deleteError);
    throw deleteError;
  }
  
  // Then insert the new password settings
  // Note: user_id is optional since we're using a single admin password approach
  const { data, error } = await supabase
    .from("password_settings")
    .insert({ 
      password_hash: passwordHash,
      user_id: null // Set to null since we're not using user-specific passwords
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error inserting new password settings:', error);
    throw error;
  }
  
  console.log('Password settings updated:', data);
  return data;
}
