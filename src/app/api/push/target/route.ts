import { NextResponse } from 'next/server';
import { sendWechatPush } from '@/lib/serverchan';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');

  if (!process.env.ADMIN_KEY || authHeader !== `Bearer ${process.env.ADMIN_KEY}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { sendKey, title, desp } = await request.json();

    if (!sendKey || !title) {
      return NextResponse.json({ error: 'Missing sendKey or title' }, { status: 400 });
    }

    const result = await sendWechatPush(sendKey, title, desp || '');
    return NextResponse.json({ success: result });
  } catch (error) {
    console.error('Push Target API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
