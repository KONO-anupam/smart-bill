import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendFreelancerAlert(params: {
  freelancerEmail: string;
  clientName: string;
  invoiceNumber: string;
  totalAmountFormatted: string;
  companyName: string;
}): Promise<void> {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Payment Received</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#09090b;padding:28px 36px;">
            <p style="margin:0;font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.3px;">${params.companyName}</p>
            <p style="margin:4px 0 0;font-size:12px;color:#a1a1aa;">Payment notification</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f0fdf4;border-bottom:1px solid #bbf7d0;padding:14px 36px;">
            <p style="margin:0;font-size:14px;color:#15803d;font-weight:600;">💸 You got paid!</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px;">
            <p style="margin:0 0 20px;font-size:15px;color:#18181b;line-height:1.6;">
              <strong>${params.clientName}</strong> just paid invoice
              <strong style="font-family:'Courier New',monospace;">#${params.invoiceNumber}</strong>.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border:1px solid #e4e4e7;border-radius:6px;margin-bottom:28px;">
              <tr>
                <td style="padding:20px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:6px 0;font-size:13px;color:#71717a;">Client</td>
                      <td style="padding:6px 0;font-size:13px;color:#09090b;font-weight:600;text-align:right;">${params.clientName}</td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;font-size:13px;color:#71717a;">Invoice</td>
                      <td style="padding:6px 0;font-size:13px;color:#09090b;font-family:'Courier New',monospace;text-align:right;">${params.invoiceNumber}</td>
                    </tr>
                    <tr>
                      <td style="padding:10px 0 6px;border-top:1px solid #e4e4e7;font-size:15px;color:#09090b;font-weight:800;">Amount</td>
                      <td style="padding:10px 0 6px;border-top:1px solid #e4e4e7;font-size:15px;color:#09090b;font-weight:800;text-align:right;">${params.totalAmountFormatted}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <p style="margin:0;font-size:13px;color:#71717a;line-height:1.6;">
              The funds are being processed to your Razorpay account per your settlement schedule.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#fafafa;border-top:1px solid #e4e4e7;padding:20px 36px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#a1a1aa;">Powered by SmartBill</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim();

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: [params.freelancerEmail],
      subject: `Payment received — ${params.clientName} paid ${params.invoiceNumber}`,
      html,
    });
  } catch (err) {
    console.error("[sendFreelancerAlert] Failed:", err);
    // Non-fatal — never break the webhook response
  }
}
