import { Resend } from 'resend';

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export type OrderEmailData = {
  orderReference: string;
  customerName: string;
  customerEmail: string;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  serviceFee: number;
  total: number;
  paymentMethod: string;
  shippingAddress: {
    street?: string;
    barangay?: string;
    city?: string;
    province?: string;
    postalCode?: string;
  };
};

export async function sendOrderConfirmation(data: OrderEmailData) {
  const resend = getResend();
  if (!resend) {
    console.warn('RESEND_API_KEY not configured — skipping email');
    return null;
  }

  const from = process.env.RESEND_FROM_EMAIL ?? 'orders@primeacademics.store';
  const to = data.customerEmail;

  const itemsHtml = data.items
    .map(
      (item) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #eee">${item.name} × ${item.quantity}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">₱${item.price.toFixed(2)}</td></tr>`,
    )
    .join('');

  const address = [
    data.shippingAddress.street,
    data.shippingAddress.barangay,
    data.shippingAddress.city,
    data.shippingAddress.province,
    data.shippingAddress.postalCode,
  ]
    .filter(Boolean)
    .join(', ');

  return resend.emails.send({
    from,
    to,
    subject: `Order Confirmed — ${data.orderReference}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h1 style="color:#1a3a2a">Prime Academics</h1>
        <h2>Order Confirmed</h2>
        <p>Thank you, ${data.customerName}!</p>
        <p>Your order <strong>${data.orderReference}</strong> has been confirmed.</p>
        <p><strong>Payment method:</strong> ${data.paymentMethod}</p>
        <h3>Order summary</h3>
        <table style="width:100%;border-collapse:collapse">
          ${itemsHtml}
          <tr>
            <td style="padding:8px 0"><strong>Subtotal</strong></td>
            <td style="text-align:right"><strong>₱${data.subtotal.toFixed(2)}</strong></td>
          </tr>
          ${
            data.serviceFee > 0
              ? `<tr><td style="padding:8px 0">Service fee</td><td style="text-align:right">₱${data.serviceFee.toFixed(2)}</td></tr>`
              : ''
          }
          <tr>
            <td style="padding:8px 0;font-size:18px"><strong>Total</strong></td>
            <td style="text-align:right;font-size:18px"><strong>₱${data.total.toFixed(2)}</strong></td>
          </tr>
        </table>
        ${
          address
            ? `<h3>Delivery address</h3><p>${address}</p>`
            : ''
        }
        <p style="color:#666;font-size:12px;margin-top:24px">
          Prime Academics — Budget School Supplies<br>
          Questions? Reply to this email.
        </p>
      </div>
    `,
  });
}

export async function sendOrderReceipt(data: OrderEmailData) {
  // Same email for now, could be a simpler receipt later
  return sendOrderConfirmation(data);
}
