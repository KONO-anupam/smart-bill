import { createServerSupabaseClient } from "@/lib/supabase/server";
import InvoicePageClient from "./InvoicePageClient";

interface Props {
  params: Promise<{ sharing_token: string }>;
}

export default async function InvoicePage({ params }: Props) {
  const { sharing_token } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  let isOwner = false;

  if (user) {
    const { data: invoice } = await supabase
      .from("invoices")
      .select("user_id")
      .eq("public_sharing_token", sharing_token)
      .single();

    isOwner = invoice?.user_id === user.id;
  }

  return <InvoicePageClient sharingToken={sharing_token} isOwner={isOwner} />;
}