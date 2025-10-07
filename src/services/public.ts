import { supabase } from "../supabase-client";

export async function listPackages() {
  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .order("created_at");
  if (error) throw error;
  return data;
}

export async function uploadReceipt(file: File) {
  const path = `uploads/${crypto.randomUUID()}-${file.name}`;
  const { error } = await supabase.storage.from("receipts").upload(path, file, {
    contentType: file.type,
    upsert: false,
    cacheControl: "3600",
  });
  if (error) throw error;
  return supabase.storage.from("receipts").getPublicUrl(path).data.publicUrl;
}

export async function createBooking(payload: {
  full_name: string; email: string; phone?: string;
  check_in_date: string; adults: number; children: number;
  package_id: string; package_name: string; options?: any; nature_preference?: string;
  receipt_url?: string; status?: string;
  price_per_person?: number; subtotal?: number; deposit_due?: number;
}) {
  // Map the payload to match the actual database schema
  const dbPayload = {
    package: payload.package_name, // Store the package name instead of ID
    checkin_date: payload.check_in_date,
    full_name: payload.full_name,
    email: payload.email,
    phone: payload.phone,
    adults: payload.adults,
    children: payload.children,
    headcount_total: payload.adults + payload.children,
    favorite_nature_thing: payload.nature_preference || '',
    wants_meals: payload.options?.meals || false,
    wants_transportation: payload.options?.transportation || false,
    wants_tour_guide: payload.options?.tourGuide || false,
    price_per_person: payload.price_per_person || 0,
    subtotal: payload.subtotal || 0,
    deposit_due: payload.deposit_due || 0,
    receipt_url: payload.receipt_url
  };
  
  const { data, error } = await supabase.from("bookings").insert([dbPayload]).select().single();
  if (error) throw error;
  return data;
}