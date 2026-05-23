// ─── Line item as used in the UI layer ───────────────────────────────────────
// rate is in major currency units (e.g. dollars/rupees) in the UI.
// The DB layer converts to minor units (cents/paise) on write and back on read.
export interface LineItem {
  description: string;
  quantity: number;
  rate: number;
}

// ─── invoice_items table row ──────────────────────────────────────────────────
// rate here mirrors the DB column: stored as integer minor units.
export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  rate: number;
  created_at: string;
}

// ─── invoices table row ───────────────────────────────────────────────────────
export interface InvoiceData {
  id: string;
  invoice_number: string;
  public_sharing_token: string;
  user_id: string;
  client_name: string;
  client_email: string;
  items: LineItem[];
  invoice_items?: InvoiceItem[];
  status: 'Pending' | 'Paid';
  created_at: string;
}

// ─── profiles table row ───────────────────────────────────────────────────────
export interface Profile {
  id: string;
  company_name: string;
  company_email: string;
  company_logo_url: string | null;
  last_invoice_sequence: number;
  updated_at: string;
}

// ─── Local React state for the invoice creation form ─────────────────────────
export interface InvoiceFormState {
  clientName: string;
  clientEmail: string;
  items: LineItem[];
}

// ─── Return type of parseInvoiceText() ───────────────────────────────────────
export interface ParsedInvoiceText {
  clientName: string | null;
  clientEmail: string | null;
  items: LineItem[];
}

// ─── Payload for inserting a new row into invoices ────────────────────────────
// items JSONB column is intentionally excluded — line items are now written
// to invoice_items separately after the invoice row is created.
export type InvoiceInsertPayload = {
  invoice_number: string;
  user_id: string;
  client_name: string;
  client_email: string;
  status: 'Pending';
};

// ─── Payload for inserting a row into invoice_items ──────────────────────────
// rate must be converted to integer minor units (multiply by 100) before insert.
export type InvoiceItemInsertPayload = {
  invoice_id: string;
  description: string;
  quantity: number;
  rate: number;
};