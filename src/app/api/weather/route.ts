import { NextResponse } from 'next/server';
import { getWeather7D, getWarnings, getCityId } from '@/lib/qweather';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location'); // lon,lat
  const locationId = searchParams.get('locationId');

  try {
    let targetId = locationId;
    let cityName = '';

    if (location && !targetId) {
      const cityInfo = await getCityId(location);
      if (cityInfo) {
        targetId = cityInfo.id;
        cityName = cityInfo.name;
      }
    }

    if (!targetId) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    const [weatherRes, warningRes] = await Promise.all([
      getWeather7D(targetId),
      getWarnings(targetId)
    ]);

    return NextResponse.json({
      city: cityName || '当前城市',
      daily: weatherRes.daily || [],
      warning: warningRes.warning || [],
      updateTime: weatherRes.updateTime || ''
    });
  } catch (error) {
    console.error('Weather API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 500 });
  }
}