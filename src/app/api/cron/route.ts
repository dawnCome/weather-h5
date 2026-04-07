import { NextResponse } from 'next/server';
import { getSubscribers } from '@/lib/kv';
import { getWeather7D, getWarnings } from '@/lib/qweather';
import { evaluateWeatherCondition } from '@/lib/weather-engine';
import { sendWechatPush } from '@/lib/serverchan';

// This is an Edge route to handle more concurrent requests efficiently
export const runtime = 'edge';

export async function GET(request: Request) {
  // CRON_SECRET is set by Vercel automatically when cron is configured
  // OR we can use our own secret for security
  const authHeader = request.headers.get('authorization');

  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const subscribersMap = await getSubscribers();
    const subscribers = Object.values(subscribersMap);

    if (subscribers.length === 0) {
      return NextResponse.json({ processed: 0, sent: 0 });
    }

    // Group users by location to minimize API calls
    const byLocation: Record<string, any[]> = {};
    for (const sub of subscribers) {
      if (!byLocation[sub.locationId]) {
        byLocation[sub.locationId] = [];
      }
      byLocation[sub.locationId].push(sub);
    }

    let sent = 0;
    const processingResults = await Promise.allSettled(
      Object.entries(byLocation).map(async ([locationId, users]) => {
        try {
          // 1. Fetch weather and warnings in parallel
          const [weatherRes, warningRes] = await Promise.all([
            getWeather7D(locationId),
            getWarnings(locationId)
          ]);

          if (!weatherRes || !weatherRes.daily) {
            console.warn(`No weather data for location ${locationId}`);
            return;
          }

          // 2. Evaluate if we should notify
          const condition = evaluateWeatherCondition(
            weatherRes.daily,
            warningRes?.warning || []
          );

          if (condition.shouldNotify) {
            // 3. Send notifications to all users at this location
            const pushPromises = users.map(user =>
              sendWechatPush(
                user.sendKey,
                `【天气提醒】${user.cityName}`,
                condition.message
              )
            );

            const results = await Promise.all(pushPromises);
            sent += results.filter(r => r === true).length;
          }
        } catch (e) {
          console.error(`Error processing location ${locationId}:`, e);
        }
      })
    );

    return NextResponse.json({
      success: true,
      processed_locations: Object.keys(byLocation).length,
      sent
    });
  } catch (error) {
    console.error('Cron API fatal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
