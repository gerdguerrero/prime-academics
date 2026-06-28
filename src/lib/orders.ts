import { getStore } from '@netlify/blobs';

type StoredOrder = {
  referenceNo: string;
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
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
};

const ORDERS_STORE = 'prime-orders';

function getOrdersStore() {
  return getStore(ORDERS_STORE);
}

function decodeEntry(entry: string | ArrayBuffer | null): StoredOrder | null {
  if (!entry) return null;
  const raw = typeof entry === 'string' ? entry : new TextDecoder().decode(entry);
  return JSON.parse(raw) as StoredOrder;
}

export async function saveOrder(order: StoredOrder): Promise<void> {
  const store = getOrdersStore();
  await store.setJSON(order.referenceNo, order);
}

export async function getOrder(referenceNo: string): Promise<StoredOrder | null> {
  const store = getOrdersStore();
  const entry = await store.get(referenceNo);
  return decodeEntry(entry);
}

export async function updateOrderStatus(
  referenceNo: string,
  status: StoredOrder['status'],
): Promise<StoredOrder | null> {
  const store = getOrdersStore();
  const entry = await store.get(referenceNo);
  if (entry) {
    const data = decodeEntry(entry);
    if (!data) return null;
    data.status = status;
    await store.setJSON(referenceNo, data);
    return data;
  }
  // Try fuzzy match
  const list = await store.list();
  const match = list?.blobs?.find((b) => b.key.endsWith(referenceNo));
  if (!match) return null;
  const matchEntry = await store.get(match.key);
  const data = decodeEntry(matchEntry);
  if (!data) return null;
  data.status = status;
  await store.setJSON(match.key, data);
  return data;
}
