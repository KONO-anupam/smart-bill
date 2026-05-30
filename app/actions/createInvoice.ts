'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { generateInvoiceNumber } from '@/lib/generateInvoiceNumber';
import type {
  LineItem,
  InvoiceInsertPayload,
  InvoiceItemInsertPayload,
} from '@/types';

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function createInvoice(params: {
  clientName: string;
  clientEmail: string;
  items: LineItem[];
}): Promise<{ sharingToken: string } | { error: string }> {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Not authenticated.' };
    }

    let invoiceNumber: string;
    try {
      invoiceNumber = await generateInvoiceNumber(user.id);
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Failed to generate invoice number.',
      };
    }

    const insertPayload: InvoiceInsertPayload = {
      invoice_number: invoiceNumber,
      user_id: user.id,
      client_name: params.clientName,
      client_email: params.clientEmail,
      status: 'Pending',
    };

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert(insertPayload)
      .select('id, public_sharing_token')
      .single();

    if (invoiceError || !invoice) {
      return { error: invoiceError?.message ?? 'Failed to create invoice.' };
    }

    const itemRows: InvoiceItemInsertPayload[] = params.items
      .filter((item) => item.description.trim() !== '')
      .map((item) => ({
        invoice_id: invoice.id,
        description: item.description.trim(),
        quantity: item.quantity,
        rate: Math.round(item.rate * 100),
      }));

    if (itemRows.length > 0) {
      const { error: itemsError } = await adminClient
        .from('invoice_items')
        .insert(itemRows);

      if (itemsError) {
        return { error: itemsError.message };
      }
    }

    const totalAmountPaise = params.items
      .filter((item) => item.description.trim() !== '')
      .reduce((sum, item) => sum + item.quantity * Math.round(item.rate * 100), 0);

    const { error: updateError } = await supabase
      .from('invoices')
      .update({ total_amount_paise: totalAmountPaise })
      .eq('id', invoice.id);

    if (updateError) {
      return { error: updateError.message };
    }

    return { sharingToken: invoice.public_sharing_token as string };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'An unexpected error occurred.',
    };
  }
}