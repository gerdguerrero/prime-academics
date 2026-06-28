import { NextResponse } from 'next/server';

type PsgcPlace = {
  code: string;
  name: string;
};

type LocationOption = {
  code: string;
  name: string;
};

const PSGC_BASE_URL = 'https://psgc.gitlab.io/api';
const METRO_MANILA: LocationOption = { code: '130000000', name: 'Metro Manila' };

function sortByName<T extends { name: string }>(items: T[]) {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

async function fetchPsgc(path: string) {
  const response = await fetch(`${PSGC_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`PSGC request failed: ${response.status}`);
  }

  return (await response.json()) as PsgcPlace[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    if (type === 'provinces') {
      const provinces = await fetchPsgc('/provinces/');
      const options = sortByName([
        METRO_MANILA,
        ...provinces.map((province) => ({ code: province.code, name: province.name })),
      ]);

      return NextResponse.json({ locations: options });
    }

    if (type === 'cities') {
      const provinceCode = searchParams.get('provinceCode')?.trim();
      if (!provinceCode) return NextResponse.json({ error: 'Missing province code.' }, { status: 400 });

      const path =
        provinceCode === METRO_MANILA.code
          ? `/regions/${METRO_MANILA.code}/cities-municipalities/`
          : `/provinces/${encodeURIComponent(provinceCode)}/cities-municipalities/`;
      const cities = await fetchPsgc(path);
      const options = sortByName(cities.map((city) => ({ code: city.code, name: city.name })));

      return NextResponse.json({ locations: options });
    }

    return NextResponse.json({ error: 'Unsupported location lookup.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load locations.' },
      { status: 502 },
    );
  }
}
