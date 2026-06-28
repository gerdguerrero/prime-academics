import { NextResponse } from 'next/server';
import { calculateEpaygamesTotal, getEpaygamesConfig } from '@/lib/epaygames';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const channelCode = typeof body?.channelCode === 'string' ? body.channelCode : '';
  const amount = Number(body?.amount);

  if (!channelCode) return NextResponse.json({ error: 'Payment channel is required.' }, { status: 400 });
  if (!Number.isFinite(amount) || amount < 0.01 || amount > 50000) {
    return NextResponse.json({ error: 'Amount must be between ₱0.01 and ₱50,000.00.' }, { status: 400 });
  }

  const config = getEpaygamesConfig();
  if (!config.isConfigured) {
    return NextResponse.json({
      configured: false,
      quote: {
        subtotal_amount: amount,
        service_fee: 0,
        total_amount: amount,
        is_web_payment: true,
        currency: { name: 'Philippine Peso', code: 'PHP', symbol: '₱' },
        channel: { name: channelCode, slug: channelCode.toLowerCase(), code: channelCode },
      },
      message: 'Gateway credentials are not configured yet. Fee preview is using subtotal only.',
    });
  }

  try {
    const quote = await calculateEpaygamesTotal(channelCode, amount);
    return NextResponse.json({ configured: true, quote });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to calculate payment fee.' },
      { status: 502 },
    );
  }
}
