import { supabase } from "../supabase-client";

export async function adminListBookings() {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("checkin_date", { ascending: true });
  if (error) throw error;
  return data;
}

export async function setBookingStatus(id: string, status: string) {
  const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function adminUpsertPackage(pkg: any) {
  const { error } = await supabase.from("packages").upsert(pkg).select().single();
  if (error) throw error;
}

export async function adminDeletePackage(id: string) {
  const { error } = await supabase.from("packages").delete().eq("id", id);
  if (error) throw error;
}
