// lib/generateInvoiceNumber
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * Generates the next sequential invoice number for a given user by calling
 * the `generate_invoice_number` PostgreSQL function via Supabase RPC.
 *
 * Returns a string in "YYYY-NNN" format (e.g. "2026-001").
 *
 * IMPORTANT: This function is server-side only. It uses the server Supabase
 * client which requires access to Next.js cookies(). Do NOT import or call
 * this from a Client Component. Invoice creation must go through a Server
 * Action or API Route Handler that calls this function.
 *
 * @param userId - The UUID of the authenticated user (from auth.uid())
 * @returns The formatted invoice number string
 * @throws If the RPC call fails or the profile row is not found
 */
export async function generateInvoiceNumber(userId: string): Promise<string> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.rpc('generate_invoice_number', {
    p_user_id: userId,
  });

  if (error) {
    throw new Error(`Failed to generate invoice number: ${error.message}`);
  }

  if (typeof data !== 'string' || data.length === 0) {
    throw new Error('generate_invoice_number returned an unexpected value');
  }

  return data;
}