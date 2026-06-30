'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useCart } from '@/lib/cart';
import { formatMoney, getProduct } from '@/lib/products';

type PaymentChannel = {
  name: string;
  slug: string;
  code: string;
  logo: string;
  is_web_payment: boolean;
  category: { name: string; slug: string };
};

type FeeQuote = {
  subtotal_amount: number;
  service_fee: number;
  total_amount: number;
  is_web_payment: boolean;
};

type LocationOption = {
  code: string;
  name: string;
};

const initialForm = {
  name: '',
  mobile: '',
  email: '',
  streetAddress: '',
  barangay: '',
  city: '',
  province: '',
  postalCode: '',
  landmark: '',
  notes: '',
};

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const [form, setForm] = useState(initialForm);
  const [channels, setChannels] = useState<PaymentChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState('');
  const [gatewayConfigured, setGatewayConfigured] = useState(false);
  const [channelMessage, setChannelMessage] = useState('');
  const [quote, setQuote] = useState<FeeQuote | null>(null);
  const [provinceOptions, setProvinceOptions] = useState<LocationOption[]>([]);
  const [cityOptions, setCityOptions] = useState<LocationOption[]>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [loadingCities, setLoadingCities] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const checkoutItems = useMemo(
    () =>
      items
        .map((item) => {
          const product = getProduct(item.productId);
          if (!product) return null;
          return { item, product, lineTotal: product.price * item.quantity };
        })
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null),
    [items],
  );

  useEffect(() => {
    let isMounted = true;
    fetch('/api/payment/channels')
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok && !payload.channels) throw new Error(payload.message || 'Unable to load payment channels.');
        return payload;
      })
      .then((payload: { configured: boolean; channels: PaymentChannel[]; message?: string }) => {
        if (!isMounted) return;
        const usableChannels = payload.channels.filter((channel) => channel.is_web_payment);
        setChannels(usableChannels);
        setGatewayConfigured(payload.configured);
        setChannelMessage(payload.message ?? '');
        setSelectedChannel((current) => current || usableChannels[0]?.code || '');
      })
      .catch((err: Error) => {
        if (!isMounted) return;
        setError(err.message);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedChannel || !subtotal) return;
    const controller = new AbortController();
    fetch('/api/payment/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelCode: selectedChannel, amount: subtotal }),
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'Unable to calculate gateway fee.');
        return payload;
      })
      .then((payload: { quote: FeeQuote; configured: boolean; message?: string }) => {
        setQuote(payload.quote);
        setGatewayConfigured(payload.configured);
        if (payload.message) setChannelMessage(payload.message);
      })
      .catch((err: Error) => {
        if (err.name !== 'AbortError') {
          setQuote(null);
          setError(err.message);
        }
      });
    return () => controller.abort();
  }, [selectedChannel, subtotal]);


  useEffect(() => {
    let isMounted = true;
    fetch('/api/locations?type=provinces')
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'Unable to load provinces.');
        return payload;
      })
      .then((payload: { locations: LocationOption[] }) => {
        if (isMounted) setProvinceOptions(payload.locations);
      })
      .catch((err: Error) => {
        if (isMounted) setError(err.message);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedProvinceCode) {
      return;
    }

    let isMounted = true;
    fetch(`/api/locations?type=cities&provinceCode=${encodeURIComponent(selectedProvinceCode)}`)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'Unable to load cities.');
        return payload;
      })
      .then((payload: { locations: LocationOption[] }) => {
        if (isMounted) setCityOptions(payload.locations);
      })
      .catch((err: Error) => {
        if (isMounted) {
          setCityOptions([]);
          setError(err.message);
        }
      })
      .finally(() => {
        if (isMounted) setLoadingCities(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedProvinceCode]);

  const updateProvince = (provinceCode: string) => {
    const province = provinceOptions.find((option) => option.code === provinceCode);
    setSelectedProvinceCode(provinceCode);
    setCityOptions([]);
    setLoadingCities(Boolean(provinceCode));
    setForm({ ...form, province: province?.name ?? '', city: '' });
  };

  const placeOrder = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelCode: selectedChannel, form, items }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to start checkout.');

      window.sessionStorage.setItem('prime-academics-last-order', JSON.stringify(payload.order));
      clearCart();

      if (payload.mode === 'gateway_redirect' && typeof payload.redirectUrl === 'string') {
        window.location.assign(payload.redirectUrl);
        return;
      }

      window.location.assign(payload.redirectUrl || `/order-success?order=${encodeURIComponent(payload.order.referenceNo)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start checkout.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedChannelDetails = channels.find((channel) => channel.code === selectedChannel);
  const serviceFee = quote?.service_fee ?? 0;
  const totalWithFee = quote?.total_amount ?? subtotal;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-black">Secure checkout</h1>
      <p className="mt-1 text-slate-600">Enter delivery details, then continue to the secure Epaygames payment page.</p>

      {channelMessage ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
          {channelMessage}
        </div>
      ) : null}

      {error ? <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div> : null}

      <form onSubmit={placeOrder} className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="space-y-6">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black">Customer details</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="grid min-w-0 gap-1 text-sm font-bold">Full name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" className="w-full min-w-0 rounded-xl border px-4 py-3 font-normal" /></label>
              <label className="grid min-w-0 gap-1 text-sm font-bold">Mobile number<input required value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} inputMode="tel" autoComplete="tel" placeholder="09XX XXX XXXX" className="w-full min-w-0 rounded-xl border px-4 py-3 font-normal" /></label>
              <label className="grid min-w-0 gap-1 text-sm font-bold md:col-span-2">Email address<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" className="w-full min-w-0 rounded-xl border px-4 py-3 font-normal" /></label>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black">Delivery address</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="grid min-w-0 gap-1 text-sm font-bold md:col-span-2">Street address / house no. / building<input required value={form.streetAddress} onChange={(e) => setForm({ ...form, streetAddress: e.target.value })} autoComplete="street-address" className="w-full min-w-0 rounded-xl border px-4 py-3 font-normal" /></label>
              <label className="grid min-w-0 gap-1 text-sm font-bold">Province<select required value={selectedProvinceCode} onChange={(e) => updateProvince(e.target.value)} autoComplete="address-level1" className="w-full min-w-0 rounded-xl border bg-white px-4 py-3 font-normal"><option value="">Select province</option>{provinceOptions.map((province) => <option key={province.code} value={province.code}>{province.name}</option>)}</select></label>
              <label className="grid min-w-0 gap-1 text-sm font-bold">City / Municipality<select required disabled={!selectedProvinceCode || loadingCities} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} autoComplete="address-level2" className="w-full min-w-0 rounded-xl border bg-white px-4 py-3 font-normal disabled:bg-slate-100"><option value="">{loadingCities ? 'Loading cities...' : selectedProvinceCode ? 'Select city / municipality' : 'Select province first'}</option>{cityOptions.map((city) => <option key={city.code} value={city.name}>{city.name}</option>)}</select></label>
              <label className="grid min-w-0 gap-1 text-sm font-bold">Barangay<input required value={form.barangay} onChange={(e) => setForm({ ...form, barangay: e.target.value })} className="w-full min-w-0 rounded-xl border px-4 py-3 font-normal" /></label>
              <label className="grid min-w-0 gap-1 text-sm font-bold">Postal code<input required value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} inputMode="numeric" autoComplete="postal-code" className="w-full min-w-0 rounded-xl border px-4 py-3 font-normal" /></label>
              <label className="grid min-w-0 gap-1 text-sm font-bold">Landmark / delivery notes<input value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} className="w-full min-w-0 rounded-xl border px-4 py-3 font-normal" /></label>
              <label className="grid min-w-0 gap-1 text-sm font-bold md:col-span-2">Order notes<textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Preferred colors, bulk notes, school requirements..." className="w-full min-w-0 rounded-xl border px-4 py-3 font-normal" /></label>
            </div>
          </div>

        </section>

        <aside className="h-fit rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black">Order summary</h2>
          {!items.length ? (
            <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-900">
              Your cart is empty. Add at least one item before continuing to payment.
            </div>
          ) : null}
          <div className="mt-4 max-h-72 space-y-3 overflow-auto">
            {checkoutItems.map(({ item, product, lineTotal }) => (
              <div key={`${item.productId}:${item.variant ?? ''}`} className="flex justify-between gap-3 text-sm">
                <span className="min-w-0"><span className="block font-bold">{item.quantity}× {product.name}</span>{item.variant ? <span className="block text-xs text-slate-500">{item.variant}</span> : null}</span>
                <strong>{formatMoney(lineTotal)}</strong>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><strong>{formatMoney(subtotal)}</strong></div>
            <div className="flex justify-between text-slate-600"><span>Gateway fee</span><strong>{formatMoney(serviceFee)}</strong></div>
            <div className="flex justify-between text-lg font-black"><span>Total to pay</span><span>{formatMoney(totalWithFee)}</span></div>
          </div>
          {items.length && !selectedChannel && channelMessage ? <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-900">{channelMessage}</div> : null}
          {selectedChannelDetails ? <div className="mt-4 rounded-xl bg-blue-50 p-3 text-xs font-semibold text-slate-700">Secure payment via {selectedChannelDetails.name}. You will be redirected to the Epaygames payment page after submitting.</div> : null}
          {items.length ? (
            <button disabled={!selectedChannel || submitting} className="mt-5 w-full rounded-xl bg-orange-500 py-3 font-black text-white disabled:bg-slate-300">
              {submitting ? 'Starting checkout...' : gatewayConfigured ? 'Continue to Payment' : 'Place Order Request'}
            </button>
          ) : (
            <Link href="/catalog" className="mt-5 block rounded-xl bg-orange-500 py-3 text-center font-black text-white">
              Shop products
            </Link>
          )}
        </aside>
      </form>
    </main>
  );
}

