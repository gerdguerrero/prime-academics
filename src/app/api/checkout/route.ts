import { NextResponse } from 'next/server';
import { generateEpaygamesTransaction, getEpaygamesConfig, makeOrderReference, splitCustomerName } from '@/lib/epaygames';
import { getProduct } from '@/lib/products';

type CheckoutItemInput = { productId?: unknown; quantity?: unknown; variant?: unknown };

type CheckoutFormInput = {
  name?: unknown;
  mobile?: unknown;
  email?: unknown;
  streetAddress?: unknown;
  barangay?: unknown;
  city?: unknown;
  province?: unknown;
  postalCode?: unknown;
  landmark?: unknown;
  notes?: unknown;
};

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function siteOriginFrom(request: Request) {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || new URL(request.url).origin;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const channelCode = asString(body?.channelCode);
  const form = (body?.form ?? {}) as CheckoutFormInput;
  const itemsInput = Array.isArray(body?.items) ? (body.items as CheckoutItemInput[]) : [];

  if (!channelCode) return NextResponse.json({ error: 'Please select a payment channel.' }, { status: 400 });
  if (!itemsInput.length) return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });

  const requiredFields = [
    ['Full name', form.name],
    ['Mobile number', form.mobile],
    ['Street address', form.streetAddress],
    ['Barangay', form.barangay],
    ['City / Municipality', form.city],
    ['Province', form.province],
    ['Postal code', form.postalCode],
  ];
  const missing = requiredFields.filter(([, value]) => !asString(value)).map(([label]) => label);
  if (missing.length) return NextResponse.json({ error: `Missing required fields: ${missing.join(', ')}` }, { status: 400 });

  const lineItems = itemsInput.map((item) => {
    const productId = asString(item.productId);
    const product = getProduct(productId);
    const quantity = Number(item.quantity);
    if (!product || !Number.isInteger(quantity) || quantity < 1) return null;
    return {
      productId: product.id,
      name: product.name,
      variant: asString(item.variant),
      quantity,
      price: product.price,
      lineTotal: Number((product.price * quantity).toFixed(2)),
    };
  });

  if (lineItems.some((item) => item === null)) return NextResponse.json({ error: 'Cart contains an invalid product or quantity.' }, { status: 400 });

  const validLineItems = lineItems.filter((item): item is NonNullable<(typeof lineItems)[number]> => item !== null);
  const amount = Number(validLineItems.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2));
  if (amount < 0.01 || amount > 50000) {
    return NextResponse.json({ error: 'Gateway payment total must be between ₱0.01 and ₱50,000.00.' }, { status: 400 });
  }

  const referenceNo = makeOrderReference();
  const origin = siteOriginFrom(request);
  const successRedirectUrl = `${origin}/order-success?order=${encodeURIComponent(referenceNo)}&payment=pending`;
  const failureRedirectUrl = `${origin}/payment-failed?order=${encodeURIComponent(referenceNo)}`;
  const callbackWebhookUrl = process.env.EPAYGAMES_WEBHOOK_URL || (process.env.NEXT_PUBLIC_SITE_URL ? `${origin}/api/payment/webhook` : undefined);
  const { firstName, lastName } = splitCustomerName(asString(form.name));
  const address = [form.streetAddress, form.barangay, form.city, form.province, form.postalCode]
    .map(asString)
    .filter(Boolean)
    .join(', ');

  const order = {
    referenceNo,
    amount,
    lineItems: validLineItems,
    customer: {
      name: asString(form.name),
      mobile: asString(form.mobile),
      email: asString(form.email),
      address,
      landmark: asString(form.landmark),
      notes: asString(form.notes),
    },
  };

  const config = getEpaygamesConfig();
  if (!config.isConfigured) {
    return NextResponse.json({
      mode: 'manual_setup_required',
      order,
      redirectUrl: `/order-success?order=${encodeURIComponent(referenceNo)}&payment=setup-required`,
      message: 'Order captured. Add Epaygames environment variables to enable automatic payment-link generation.',
    });
  }

  try {
    const transaction = await generateEpaygamesTransaction({
      channelCode,
      amount,
      referenceNo,
      successRedirectUrl,
      failureRedirectUrl,
      callbackWebhookUrl,
      customer: {
        email: asString(form.email),
        mobileNumber: asString(form.mobile).replace(/^\+?63|^0/, ''),
        firstName,
        lastName,
        city: asString(form.city),
        state: asString(form.province),
        zipCode: asString(form.postalCode),
        address,
      },
    });

    if (!transaction.web_payment_url) {
      return NextResponse.json({ error: 'Gateway did not return a web payment URL.' }, { status: 502 });
    }

    return NextResponse.json({
      mode: 'gateway_redirect',
      order,
      transaction,
      redirectUrl: transaction.web_payment_url,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to generate payment transaction.' },
      { status: 502 },
    );
  }
}
