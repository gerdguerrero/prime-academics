import * as crypto from 'crypto';

export type EpaygamesChannel = {
  name: string;
  description: string | null;
  slug: string;
  code: string;
  logo: string;
  is_web_payment: boolean;
  is_disabled: boolean;
  currencies: { name: string; code: string; symbol: string }[];
  category: { name: string; description: string | null; slug: string };
};

export type EpaygamesTransaction = {
  subtotal_amount: number;
  service_fee: number;
  total_amount: number;
  reference_no: string;
  provider_reference_no: string | null;
  other_reference_no: string | null;
  status: 'pending' | 'completed' | 'cancelled';
  barcode_url: string | null;
  qrcode_url: string | null;
  link_url: string | null;
  is_web_payment: boolean;
  web_payment_url: string | null;
  qrcode: string | null;
  is_expired: boolean;
  expires_at: string;
  date: string;
  items: unknown[];
  currency: { name: string; code: string | null; symbol: string | null };
  channel: {
    name: string;
    desciption?: string | null;
    description?: string | null;
    instruction?: string;
    slug: string;
    code?: string;
    logo?: string;
    category?: { name: string; description: string | null; slug: string };
  };
};

type TokenCache = {
  token: string;
  expiresAt: number;
};

let tokenCache: TokenCache | null = null;

const DEFAULT_CHANNELS: EpaygamesChannel[] = [
  {
    name: 'GCash',
    description: null,
    slug: 'gcash-trn',
    code: 'GCASH_TRN',
    logo: 'https://cdn.eplayment.co/payment-channels/gcash.png',
    is_web_payment: true,
    is_disabled: false,
    currencies: [{ name: 'Philippine Peso', code: 'PHP', symbol: '₱' }],
    category: { name: 'E-Wallet', description: 'E-Wallet payment channels.', slug: 'e-wallet' },
  },
  {
    name: 'PayMaya',
    description: null,
    slug: 'paymaya',
    code: 'PAYMAYA_QR',
    logo: 'https://cdn.eplayment.co/payment-channels/paymaya.jpg',
    is_web_payment: true,
    is_disabled: false,
    currencies: [{ name: 'Philippine Peso', code: 'PHP', symbol: '₱' }],
    category: { name: 'E-Wallet', description: 'E-Wallet payment channels.', slug: 'e-wallet' },
  },
  {
    name: 'Bayad',
    description: null,
    slug: 'bayad',
    code: 'BAYAD',
    logo: 'https://cdn.eplayment.co/payment-channels/bayad.png',
    is_web_payment: false,
    is_disabled: false,
    currencies: [{ name: 'Philippine Peso', code: 'PHP', symbol: '₱' }],
    category: { name: 'OTC', description: 'Over-the-counter payment channels.', slug: 'otc' },
  },
];

export function getEpaygamesConfig() {
  const baseUrl = process.env.EPAYGAMES_BASE_URL ?? 'https://api-stg.epaygames.io';
  const username = process.env.EPAYGAMES_USERNAME;
  const password = process.env.EPAYGAMES_PASSWORD;
  const signatureKey = process.env.EPAYGAMES_SIGNATURE_KEY;
  const server = process.env.EPAYGAMES_SERVER ?? '1';
  return {
    baseUrl: baseUrl.replace(/\/$/, ''),
    username,
    password,
    signatureKey,
    server,
    isConfigured: Boolean(username && password && signatureKey),
  };
}

export function getFallbackChannels() {
  return DEFAULT_CHANNELS;
}

async function epaygamesFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const config = getEpaygamesConfig();
  const response = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Server': config.server,
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = typeof payload?.message === 'string' && payload.message ? payload.message : `Epaygames request failed with ${response.status}`;
    throw new Error(message);
  }
  return payload as T;
}

export async function getEpaygamesToken() {
  const config = getEpaygamesConfig();
  if (!config.username || !config.password) {
    throw new Error('Epaygames credentials are not configured. Set EPAYGAMES_USERNAME and EPAYGAMES_PASSWORD.');
  }

  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt - now > 5 * 60 * 1000) return tokenCache.token;

  const search = new URLSearchParams({ username: config.username, password: config.password });
  const payload = await epaygamesFetch<{ data: { token: string; expires_in: number } }>(`/v1/biller/token/create?${search.toString()}`, {
    method: 'POST',
  });

  tokenCache = {
    token: payload.data.token,
    expiresAt: now + Math.max(0, payload.data.expires_in - 300) * 1000,
  };

  return tokenCache.token;
}

async function authorizedFetch<T>(path: string, init: RequestInit = {}) {
  const token = await getEpaygamesToken();
  return epaygamesFetch<T>(path, {
    ...init,
    headers: {
      Authorization: 'Bearer ' + token,
      ...(init.headers ?? {}),
    },
  });
}

export async function getEpaygamesChannels() {
  const payload = await authorizedFetch<{ data: EpaygamesChannel[] }>('/v1/biller/channels');
  return payload.data.filter((channel) => !channel.is_disabled);
}

export async function calculateEpaygamesTotal(channelCode: string, amount: number) {
  const search = new URLSearchParams({ channel_code: channelCode, amount: amount.toFixed(2), currency: 'PHP' });
  const payload = await authorizedFetch<{ data: Pick<EpaygamesTransaction, 'subtotal_amount' | 'service_fee' | 'total_amount' | 'is_web_payment' | 'currency' | 'channel'> }>(
    `/v1/biller/channels/calculate?${search.toString()}`,
  );
  return payload.data;
}

export type GenerateEpaygamesTransactionInput = {
  channelCode: string;
  amount: number;
  referenceNo: string;
  successRedirectUrl: string;
  failureRedirectUrl: string;
  callbackWebhookUrl?: string;
  customer?: {
    email?: string;
    mobileNumber?: string;
    firstName?: string;
    lastName?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    address?: string;
  };
};

export async function generateEpaygamesTransaction(input: GenerateEpaygamesTransactionInput) {
  const body: Record<string, string | number> = {
    channel_code: input.channelCode,
    amount: Number(input.amount.toFixed(2)),
    currency: 'PHP',
    reference_no: input.referenceNo,
    success_redirect_url: input.successRedirectUrl,
    failure_redirect_url: input.failureRedirectUrl,
  };

  if (input.callbackWebhookUrl) body.callback_webhook_url = input.callbackWebhookUrl;

  if (input.channelCode === 'PAYMAYA_CARD' && input.customer) {
    if (input.customer.email) body.email = input.customer.email;
    if (input.customer.mobileNumber) body.mobile_number = input.customer.mobileNumber;
    if (input.customer.firstName) body.first_name = input.customer.firstName;
    if (input.customer.lastName) body.last_name = input.customer.lastName;
    if (input.customer.city) body.city = input.customer.city;
    if (input.customer.state) body.state = input.customer.state;
    if (input.customer.zipCode) body.zip_code = input.customer.zipCode;
    if (input.customer.address) body.address = input.customer.address;
    body.country_code = 'PH';
  }

  const payload = await authorizedFetch<{ data: EpaygamesTransaction }>('/v1/biller/transactions/generate', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  return payload.data;
}

export function makeOrderReference() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `PA-${timestamp}-${random}`;
}

export function splitCustomerName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { firstName: parts[0] ?? 'Customer', lastName: 'PrimeAcademics' };
  return { firstName: parts.slice(0, -1).join(' '), lastName: parts.at(-1) ?? 'Customer' };
}

export function verifyEpaygamesSignature(amount: number | string, referenceNo: string, signature: string) {
  const { signatureKey } = getEpaygamesConfig();
  if (!signatureKey) return false;
  const expected = crypto.createHmac('sha256', signatureKey).update(`${amount}@${referenceNo}`).digest('hex');
  if (signature.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
}
