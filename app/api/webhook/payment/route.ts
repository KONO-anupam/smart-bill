import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { sendReceiptEmail } from "@/lib/email/sendReceipt";
import { sendFreelancerAlert } from "@/lib/email/sendFreelancerAlert";

// Admin client — bypasses RLS for trusted webhook writes
const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function formatUSD(paise: number): string {
  return (paise / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

/**
 * Verifies the Razorpay webhook signature.
 * Razorpay signs the raw body with HMAC-SHA256 using the webhook secret.
 */
function verifyRazorpaySignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  // Constant-time comparison to prevent timing attacks
  if (expectedSignature.length !== signature.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expectedSignature.length; i++) {
    mismatch |= expectedSignature.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[webhook] RAZORPAY_WEBHOOK_SECRET not configured.");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
  }

  // Read raw body for signature verification — must happen BEFORE any parsing
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";

  if (!verifyRazorpaySignature(rawBody, signature, webhookSecret)) {
    console.warn("[webhook] Invalid signature — possible spoofed request.");
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event: {
    event: string;
    payload: {
      payment: {
        entity: {
          order_id: string;
          amount: number;
          email: string;
        };
      };
    };
  };

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  // Only handle successful payment capture
  if (event.event !== "payment.captured") {
    return NextResponse.json({ received: true });
  }

  const { order_id: orderId, amount: amountPaise, email: clientEmail } =
    event.payload.payment.entity;

  // Look up the invoice by the Razorpay order ID stored in notes
  const { data: razorpayOrder } = await adminClient
    .rpc("get_invoice_by_order_id", { p_order_id: orderId })
    .single();

  // Fallback: query invoices table directly via notes (if RPC not available)
  // Instead, we query by joining Razorpay order notes stored at order creation.
  // Since we stored sharing_token in order notes, we need it here.
  // Best approach: store order_id → sharing_token mapping in a separate table.
  // 
  // Recommended: Add a `razorpay_orders` table:
  //   id, order_id (text, unique), sharing_token (text), created_at
  // Then insert into it in createRazorpayOrder action.
  // Here we query it:

  const { data: orderMapping, error: mappingError } = await adminClient
    .from("razorpay_orders")
    .select("sharing_token")
    .eq("order_id", orderId)
    .single();

  if (mappingError || !orderMapping) {
    console.error("[webhook] Could not find invoice for order:", orderId);
    // Return 200 so Razorpay doesn't retry — we log but don't crash
    return NextResponse.json({ received: true });
  }

  const { sharing_token: sharingToken } = orderMapping;

  // Fetch invoice + profile in parallel
  const [{ data: invoice }, ] = await Promise.all([
    adminClient
      .from("invoices")
      .select("id, invoice_number, status, client_name, client_email, user_id, total_amount_paise")
      .eq("public_sharing_token", sharingToken)
      .single(),
  ]);

  if (!invoice) {
    console.error("[webhook] Invoice not found for sharing_token:", sharingToken);
    return NextResponse.json({ received: true });
  }

  // Idempotency guard — skip if already marked Paid
  if (invoice.status === "Paid") {
    return NextResponse.json({ received: true, note: "Already processed." });
  }

  // Mark invoice as paid
  const { error: updateError } = await adminClient
    .from("invoices")
    .update({
      status: "Paid",
      total_amount_paise: amountPaise, // Use actual charged amount
    })
    .eq("id", invoice.id);

  if (updateError) {
    console.error("[webhook] Failed to update invoice status:", updateError);
    return NextResponse.json({ error: "DB update failed." }, { status: 500 });
  }

  // Fetch freelancer profile for email
  const { data: profile } = await adminClient
    .from("profiles")
    .select("company_name, company_email")
    .eq("id", invoice.user_id)
    .single();

  const companyName = profile?.company_name ?? "SmartBill";
  const freelancerEmail = profile?.company_email;
  const amountFormatted = formatUSD(amountPaise);

  // Dispatch both emails concurrently — neither blocks the other
  const emailTasks: Promise<void>[] = [
    sendReceiptEmail({
      clientEmail: invoice.client_email,
      clientName: invoice.client_name,
      companyName,
      invoiceNumber: invoice.invoice_number,
      totalAmountFormatted: amountFormatted,
      paidAt: new Date().toISOString(),
    }),
  ];

  if (freelancerEmail) {
    emailTasks.push(
      sendFreelancerAlert({
        freelancerEmail,
        clientName: invoice.client_name,
        invoiceNumber: invoice.invoice_number,
        totalAmountFormatted: amountFormatted,
        companyName,
      })
    );
  }

  await Promise.allSettled(emailTasks); // allSettled — never throw on email failure

  return NextResponse.json({ received: true, invoiceId: invoice.id });
}