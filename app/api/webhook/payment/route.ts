import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { sendReceiptEmail } from '@/lib/email/sendReceipt';

interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment: {
      entity: {
        notes: {
          sharing_token: string;
          invoice_number: string;
        };
        status: string;
      };
    };
  };
}

interface InvoiceItemRow {
  quantity: number;
  rate: number;
}

interface InvoiceDetailsRow {
  invoice_number: string;
  client_name: string;
  client_email: string;
  created_at: string;
  invoice_items: InvoiceItemRow[];
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const rawBody = await request.text();

    const signature = request.headers.get('x-razorpay-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(rawBody)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const receivedBuffer = Buffer.from(signature, 'hex');

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const webhookPayload = JSON.parse(rawBody) as RazorpayWebhookPayload;

    if (webhookPayload.event !== 'payment.captured') {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const sharingToken =
      webhookPayload.payload.payment.entity.notes?.sharing_token;

    if (!sharingToken || typeof sharingToken !== 'string') {
      return NextResponse.json(
        { error: 'Missing sharing_token in payment notes' },
        { status: 400 }
      );
    }

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: invoice, error: fetchError } = await adminClient
      .from('invoices')
      .select('id, status')
      .eq('public_sharing_token', sharingToken)
      .single();

    if (fetchError || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    if (invoice.status === 'Paid') {
      return NextResponse.json(
        { received: true, message: 'Already paid' },
        { status: 200 }
      );
    }

    const { error: updateError } = await adminClient
      .from('invoices')
      .update({ status: 'Paid' })
      .eq('public_sharing_token', sharingToken);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    // Fetch invoice details for the receipt email
    const { data: invoiceDetails } = await adminClient
      .from('invoices')
      .select(`
        invoice_number,
        client_name,
        client_email,
        created_at,
        invoice_items ( quantity, rate )
      `)
      .eq('public_sharing_token', sharingToken)
      .single();

    if (invoiceDetails) {
      const details = invoiceDetails as InvoiceDetailsRow;

      const totalPaise = (details.invoice_items ?? []).reduce(
        (sum: number, item: InvoiceItemRow) => sum + item.quantity * item.rate,
        0
      );

      const totalFormatted = (totalPaise / 100).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
      });

      await sendReceiptEmail({
        clientEmail: details.client_email,
        clientName: details.client_name,
        companyName: 'InvoiceFlow',
        invoiceNumber: details.invoice_number,
        totalAmountFormatted: totalFormatted,
        paidAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}