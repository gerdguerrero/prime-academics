import { NextResponse } from 'next/server';
import { verifyEpaygamesSignature } from '@/lib/epaygames';

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

  // No database is wired yet. This endpoint verifies authenticity and acknowledges quickly.
  // When persistence is added, update the matching order by referenceNo asynchronously.
  return NextResponse.json({ ok: true, referenceNo, status });
}
