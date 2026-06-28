import { NextResponse } from 'next/server';
import { getEpaygamesChannels, getEpaygamesConfig, getFallbackChannels } from '@/lib/epaygames';

export async function GET() {
  const config = getEpaygamesConfig();

  if (!config.isConfigured) {
    return NextResponse.json({
      configured: false,
      channels: getFallbackChannels(),
      message: 'Epaygames credentials are not configured yet. Showing documented gateway channels for checkout preview.',
    });
  }

  try {
    const channels = await getEpaygamesChannels();
    return NextResponse.json({ configured: true, channels });
  } catch (error) {
    return NextResponse.json(
      {
        configured: true,
        channels: getFallbackChannels(),
        message: error instanceof Error ? error.message : 'Unable to load live Epaygames channels.',
      },
      { status: 502 },
    );
  }
}
