// lib/email/sendReceipt
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function formatDateFromISO(iso: string): string {
  const d = new Date(iso);
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}, ${d.getFullYear()}`;
}

export async function sendReceiptEmail(params: {
  clientEmail: string;
  clientName: string;
  companyName: string;
  invoiceNumber: string;
  totalAmountFormatted: string;
  paidAt: string;
}): Promise<void> {
  const formattedDate = formatDateFromISO(params.paidAt);

  const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payment Receipt</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color: #09090b; padding: 32px 40px;">
              <p style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                ${params.companyName}
              </p>
              <p style="margin: 6px 0 0; font-size: 13px; color: #a1a1aa;">
                Payment Receipt
              </p>
            </td>
          </tr>

          <!-- Status Banner -->
          <tr>
            <td style="background-color: #f0fdf4; border-bottom: 1px solid #bbf7d0; padding: 16px 40px;">
              <p style="margin: 0; font-size: 14px; color: #15803d; font-weight: 600;">
                ✅ Payment confirmed
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px; font-size: 15px; color: #18181b; line-height: 1.6;">
                Hi ${params.clientName},
              </p>
              <p style="margin: 0 0 32px; font-size: 15px; color: #3f3f46; line-height: 1.6;">
                Your payment of <strong style="color: #09090b;">${params.totalAmountFormatted}</strong> to <strong style="color: #09090b;">${params.companyName}</strong> has been confirmed. Thank you.
              </p>

              <!-- Receipt Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 6px; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #71717a; width: 40%;">Invoice number</td>
                        <td style="padding: 6px 0; font-size: 13px; color: #09090b; font-family: 'Courier New', monospace; font-weight: 600; text-align: right;">${params.invoiceNumber}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #71717a;">Payment date</td>
                        <td style="padding: 6px 0; font-size: 13px; color: #09090b; text-align: right;">${formattedDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0 6px; border-top: 1px solid #e4e4e7; font-size: 14px; color: #09090b; font-weight: 700;">Amount paid</td>
                        <td style="padding: 10px 0 6px; border-top: 1px solid #e4e4e7; font-size: 14px; color: #09090b; font-weight: 700; text-align: right;">${params.totalAmountFormatted}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 14px; color: #3f3f46; line-height: 1.6;">
                Please retain this email as your receipt. If you have any questions, reply to this email or contact ${params.companyName} directly.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; border-top: 1px solid #e4e4e7; padding: 24px 40px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #a1a1aa; line-height: 1.6;">
                This is an automated receipt. Please retain for your records.<br />
                Powered by SmartBill
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: [params.clientEmail],
      subject: `Receipt for Invoice ${params.invoiceNumber} from ${params.companyName}`,
      html: htmlBody,
    });
  } catch (err) {
    console.error('[sendReceiptEmail] Failed to send receipt email:', err);
    // Intentionally not re-throwing — email failure must never break the webhook
  }
}