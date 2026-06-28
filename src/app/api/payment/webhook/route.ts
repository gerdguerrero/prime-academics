import { NextResponse } from 'next/server';
import { verifyEpaygamesSignature } from '@/lib/epaygames';
import { updateOrderStatus } from '@/lib/orders';
import { sendOrderConfirmation } from '@/lib/email';

const STAGING_IPS = ['43.198.4.7'];
const PRODUCTION_IPS = ['18.166.179.109', '18.166.252.124'];
const ALLOWED_IPS = new Set([...(process.env.EPAYGAMES_ENV === 'production' ? PRODUCTION_IPS : STAGING_IPS), ...(process.env.EPAYGAMES_WEBHOOK_ALLOWED_IPS?.split(',').map((ip) => ip.trim()).filter(Boolean) ?? [])]);

function getClientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return request.headers.get('x-real-ip') || forwarded || '';
}

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const enforceIpWhitelist = process.env.EPAYGAMES_ENFORCE_IP_WHITELIST === 'true';

  if (enforceIpWhitelist && (!clientIp || !ALLOWED_IPS.has(clientIp))) {
    return NextResponse.json({ error: 'Webhook source IP is not allowed.' }, { status: 403 });
  }

  const payload = await request.json().catch(() => null);
  const data = payload?.data;
  const referenceNo = typeof data?.reference_no === 'string' ? data.reference_no : '';
  const amount = data?.amount;
  const signature = typeof data?.signature === 'string' ? data.signature : '';
  const status = typeof data?.status === 'string' ? data.status : '';

  if (!referenceNo || amount === undefined || !signature) {
    return NextResponse.json({ error: 'Invalid webhook payload.' }, { status: 400 });
  }

  if (!verifyEpaygamesSignature(amount, referenceNo, signature)) {
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 401 });
  }

  if (!['pending', 'completed', 'cancelled'].includes(status)) {
    return NextResponse.json({ error: 'Invalid transaction status.' }, { status: 400 });
  }

  // Update order and send email on completion
  if (status === 'completed') {
    const order = await updateOrderStatus(referenceNo, 'completed');
    if (order) {
      sendOrderConfirmation({
        orderReference: order.referenceNo,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        items: order.items,
        subtotal: order.subtotal,
        serviceFee: order.serviceFee,
        total: order.total,
        paymentMethod: order.paymentMethod,
        shippingAddress: order.shippingAddress,
      }).catch((err) =>
        console.error('Failed to send order confirmation email:', err),
      );
    }
  } else {
    await updateOrderStatus(referenceNo, status).catch(() => null);
  }

  return NextResponse.json({ ok: true, referenceNo, status });
}
