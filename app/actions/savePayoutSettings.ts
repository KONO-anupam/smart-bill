"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { encrypt } from "@/lib/crypto";

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function savePayoutSettings(params: {
  razorpayKeyId: string;
  razorpayKeySecret: string;
  upiId?: string;
}): Promise<{ success: true } | { error: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated." };

    if (!params.razorpayKeyId.trim() || !params.razorpayKeySecret.trim()) {
      return { error: "Razorpay Key ID and Secret are required." };
    }

    const updatePayload: Record<string, string | null> = {
      encrypted_razorpay_key_id: encrypt(params.razorpayKeyId.trim()),
      encrypted_razorpay_key_secret: encrypt(params.razorpayKeySecret.trim()),
      user_upi_id: params.upiId?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await adminClient
      .from("profiles")
      .update(updatePayload)
      .eq("id", user.id);

    if (error) return { error: error.message };

    return { success: true };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Unexpected error saving payout settings.",
    };
  }
}