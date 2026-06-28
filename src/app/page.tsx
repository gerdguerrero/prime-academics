import Link from 'next/link';
import { Countdown } from '@/components/countdown';
import { ProductCard, SectionHeader } from '@/components/product-card';
import { bulkPacks, categories, featuredProducts, flashDeals, products, schoolKits, under99 } from '@/lib/products';

const promos = [
  { title: 'Back-to-School Mega Deals', copy: 'Pens, pads, notebooks, and kits at budget-friendly prices.', cta: 'Shop deals', href: '/catalog?category=Deals', className: 'md:col-span-2 md:row-span-2 bg-gradient-to-br from-blue-700 to-blue-500', image: 'https://www.officewarehouse.com.ph/__resources/_web_data_/products/products/image_gallery/3633_210.jpg' },
  { title: 'Flash Deals Today', copy: 'Daily-reset countdown. Grab school picks before the timer ends.', cta: 'View flash deals', href: '#flash-deals', className: 'bg-gradient-to-br from-orange-500 to-red-500', image: 'https://www.officewarehouse.com.ph/__resources/_web_data_/products/products/image_gallery/4053_129.jpg' },
  { title: 'Under ₱99 Finds', copy: 'Small essentials, big savings.', cta: 'Shop under ₱99', href: '#under-99', className: 'bg-gradient-to-br from-cyan-500 to-blue-500', image: 'https://www.officewarehouse.com.ph/__resources/_web_data_/products/products/image_gallery/7991_6654.JPG' },
  { title: 'School Kits from ₱199', copy: 'Ready-to-add bundles for students and teachers.', cta: 'Shop kits', href: '#school-kits', className: 'md:col-span-2 bg-gradient-to-br from-slate-900 to-blue-800', image: 'https://img.lazcdn.com/g/p/edb8d2e714ccb146efac8fc96c7eaa1f.jpg_720x720q80.jpg' },
];

const trustedBrands = [
  { name: 'Mongol', mark: 'MONGOL', detail: 'No. 2 pencils', className: 'bg-yellow-50 text-yellow-700 ring-yellow-200' },
  { name: 'Pilot', mark: 'Pilot', detail: 'pens & markers', className: 'bg-blue-50 text-blue-700 ring-blue-200' },
  { name: 'Faber-Castell', mark: 'Faber-Castell', detail: 'pencils & colors', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  { name: 'Crayola', mark: 'Crayola', detail: 'crayons', className: 'bg-green-50 text-green-700 ring-green-200' },
  { name: 'STABILO', mark: 'STABILO', detail: 'highlighters', className: 'bg-orange-50 text-orange-600 ring-orange-200' },
  { name: 'Casio', mark: 'CASIO', detail: 'calculators', className: 'bg-slate-50 text-slate-700 ring-slate-200' },
  { name: '3M', mark: '3M', detail: 'notes & tape', className: 'bg-red-50 text-red-600 ring-red-200' },
  { name: 'Deli', mark: 'deli', detail: 'office supplies', className: 'bg-sky-50 text-sky-700 ring-sky-200' },
  { name: 'Panda', mark: 'PANDA', detail: 'ballpens', className: 'bg-indigo-50 text-indigo-700 ring-indigo-200' },
  { name: 'Corona', mark: 'CORONA', detail: 'paper products', className: 'bg-cyan-50 text-cyan-700 ring-cyan-200' },
];

export default function Home() {
  return (
    <main>
      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[250px_1fr]">
        <aside className="hidden rounded-2xl border bg-white p-4 shadow-sm lg:block">
          <h2 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-900">All Categories</h2>
          <div className="grid gap-1">
            {categories.map((category) => <Link key={category} href={`/catalog?category=${encodeURIComponent(category)}`} className="rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700">{category}</Link>)}
          </div>
          <div className="mt-5 rounded-xl bg-orange-50 p-4 text-sm">
            <p className="font-black text-orange-600">Bulk-friendly packs</p>
            <p className="mt-1 text-slate-600">Check availability for classrooms and school offices.</p>
          </div>
        </aside>

        <div className="grid gap-4 md:grid-cols-4 md:grid-rows-2">
          {promos.map((promo) => (
            <Link key={promo.title} href={promo.href} className={`relative min-h-[190px] overflow-hidden rounded-2xl p-6 text-white shadow-lg ${promo.className}`}>
              <img src={promo.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-screen" />
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                  <p className="mb-2 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-black uppercase">Prime deals</p>
                  <h1 className="max-w-md text-3xl font-black tracking-tight md:text-5xl">{promo.title}</h1>
                  <p className="mt-2 max-w-sm text-sm font-semibold text-white/90">{promo.copy}</p>
                </div>
                <span className="mt-4 inline-flex w-fit rounded-xl bg-white px-4 py-2 text-sm font-black text-slate-950">{promo.cta} →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-3">
        <div className="grid gap-3 rounded-2xl border bg-white p-4 text-sm font-bold text-slate-700 shadow-sm md:grid-cols-4">
          <div className="rounded-xl bg-blue-50 p-4"><span className="text-blue-700">✓ Authentic school brands</span><p className="mt-1 text-xs font-medium text-slate-500">Mongol, Pilot, Faber-Castell, Crayola, Casio, Deli, and more.</p></div>
          <div className="rounded-xl bg-orange-50 p-4"><span className="text-orange-600">✓ Budget-friendly pricing</span><p className="mt-1 text-xs font-medium text-slate-500">Everyday supplies, under-₱99 finds, bundles, and bulk packs.</p></div>
          <div className="rounded-xl bg-blue-50 p-4"><span className="text-blue-700">✓ Bulk order support</span><p className="mt-1 text-xs font-medium text-slate-500">Classroom packs, school kits, and quote requests for schools.</p></div>
          <div className="rounded-xl bg-orange-50 p-4"><span className="text-orange-600">✓ Secure checkout</span><p className="mt-1 text-xs font-medium text-slate-500">Pay securely via Maya. Enter your delivery details and complete payment in one flow.</p></div>
        </div>
      </section>

      <section id="flash-deals" className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-5 flex flex-col justify-between gap-3 rounded-2xl bg-slate-950 p-5 text-white md:flex-row md:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-400">Flash Deals Today</p>
            <h2 className="text-3xl font-black">School supplies sale ends in</h2>
          </div>
          <div className="rounded-xl bg-orange-500 px-5 py-3"><Countdown /></div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">{flashDeals.slice(0, 10).map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </section>

      <section id="school-kits" className="mx-auto max-w-7xl px-4 py-8">
        <SectionHeader eyebrow="Bundle and save" title="School Kits from ₱199" href="/catalog?category=School%20Kits" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {schoolKits.map((kit) => (
            <div key={kit.id} className="rounded-2xl border bg-white p-4 shadow-sm">
              <ProductCard product={kit} compact={false} />
              <div className="mt-3 rounded-xl bg-blue-50 p-3 text-xs text-slate-700"><strong>Included:</strong> {kit.kitItems?.join(', ')}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <SectionHeader eyebrow="Popular picks" title="Best Sellers Students Love" href="/catalog" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">{featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </section>

      <section id="under-99" className="mx-auto max-w-7xl px-4 py-8">
        <SectionHeader eyebrow="Small budget, useful picks" title="Under ₱99 Finds" href="/catalog" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">{under99.slice(0, 12).map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <SectionHeader eyebrow="For classrooms and school offices" title="Bulk-Friendly Packs" href="/bulk-orders" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">{bulkPacks.slice(0, 10).map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="overflow-hidden rounded-2xl border bg-white p-6 shadow-sm">
          <SectionHeader eyebrow="Trusted brands" title="Brands shoppers recognize" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-10">
            {trustedBrands.map((brand) => (
              <div key={brand.name} className="group rounded-2xl border bg-gradient-to-b from-white to-slate-50 p-3 text-center shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg">
                <div className={`mx-auto grid h-16 w-full place-items-center rounded-2xl px-3 text-base font-black tracking-tight ring-1 ${brand.className}`}>
                  {brand.mark}
                </div>
                <p className="mt-3 text-sm font-black leading-tight text-slate-800">{brand.name}</p>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{brand.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <SectionHeader eyebrow="Fresh stock feel" title="New Arrivals and Popular Picks" href="/catalog" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">{products.slice(20, 32).map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </section>
    </main>
  );
}
