import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teamCode = searchParams.get('code');
    
    if (!teamCode) {
      return NextResponse.json({ error: 'Missing team code' }, { status: 400 });
    }
    
    const status = await kv.get(`team_status_${teamCode}`);
    
    return NextResponse.json({ status: status || 'active' });
  } catch (error) {
    console.error('KV Status Error:', error);
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
  }
}
