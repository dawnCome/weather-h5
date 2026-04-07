import { NextResponse } from 'next/server';
import { upsertSubscriber, deleteSubscriber } from '@/lib/kv';

export async function POST(request: Request) {
  try {
    const { userId, sendKey, locationId, cityName, action } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    if (action === 'delete') {
      await deleteSubscriber(userId);
      return NextResponse.json({ success: true, message: 'Unsubscribed successfully' });
    }

    if (!sendKey || !locationId || !cityName) {
      return NextResponse.json({ error: 'Missing parameters for subscription' }, { status: 400 });
    }

    await upsertSubscriber(userId, { sendKey, locationId, cityName });
    return NextResponse.json({ success: true, message: 'Subscribed successfully' });
  } catch (error) {
    console.error('Subscribe API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
