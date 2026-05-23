'use server';

import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function createRazorpayOrder(params: {
  sharingToken: string;
  amountInPaise: number;
  currency: string;
  invoiceNumber: string;
}): Promise<{ orderId: string } | { error: string }> {
  if (params.amountInPaise <= 0) {
    return { error: 'Invoice amount must be greater than zero.' };
  }

  try {
    const order = await razorpay.orders.create({
      amount: params.amountInPaise,
      currency: params.currency,
      receipt: params.invoiceNumber,
      notes: {
        sharing_token: params.sharingToken,
        invoice_number: params.invoiceNumber,
      },
    });

    return { orderId: order.id };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Failed to create payment order.',
    };
  }
}