import { NextResponse } from 'next/server';
import { getCityId } from '@/lib/qweather';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');

  if (!city) {
    return NextResponse.json({ error: 'Missing city name' }, { status: 400 });
  }

  try {
    const result = await getCityId(city);
    return NextResponse.json(result);
  } catch (error) {
    console.error('City Lookup API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
