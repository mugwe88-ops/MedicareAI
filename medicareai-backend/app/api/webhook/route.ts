import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  // These are the names Meta sends in the query string
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Replace 'medicare_secret_2026' with whatever you put in your .env
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Log everything so you can see it on your phone/hosting dashboard
  console.log('Incoming WhatsApp Message:', JSON.stringify(body, null, 2));

  // Meta requires a 200 OK response within 4 seconds
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}