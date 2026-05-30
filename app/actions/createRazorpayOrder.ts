"use server";

import Razorpay from "razorpay";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/crypto";

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function createRazorpayOrder(params: {
  sharingToken: string;
  amountInPaise: number;
  currency: string;
  invoiceNumber: string;
}): Promise<{ orderId: string } | { error: string }> {
  if (params.amountInPaise <= 0) {
    return { error: "Invoice amount must be greater than zero." };
  }

  try {
    const supabase = await createServerSupabaseClient();

    // Fetch the invoice to get its owner
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("user_id")
      .eq("public_sharing_token", params.sharingToken)
      .single();

    if (invoiceError || !invoice) {
      return { error: "Invoice not found." };
    }

    // Fetch the freelancer's encrypted keys
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("encrypted_razorpay_key_id, encrypted_razorpay_key_secret")
      .eq("id", invoice.user_id)
      .single();

    if (profileError || !profile) {
      return { error: "Could not load payment configuration." };
    }

    if (!profile.encrypted_razorpay_key_id || !profile.encrypted_razorpay_key_secret) {
      return { error: "The invoice issuer has not configured payment settings yet." };
    }

    let keyId: string;
    let keySecret: string;
    try {
      keyId = decrypt(profile.encrypted_razorpay_key_id);
      keySecret = decrypt(profile.encrypted_razorpay_key_secret);
    } catch {
      return { error: "Failed to load payment credentials. Contact the invoice issuer." };
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await razorpay.orders.create({
      amount: params.amountInPaise,
      currency: params.currency,
      receipt: params.invoiceNumber,
      notes: {
        sharing_token: params.sharingToken,
        invoice_number: params.invoiceNumber,
      },
    });

    // Store order_id → sharing_token mapping for webhook lookup
    await adminClient.from("razorpay_orders").insert({
      order_id: order.id,
      sharing_token: params.sharingToken,
    });

    return { orderId: order.id };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to create payment order.",
    };
  }
}