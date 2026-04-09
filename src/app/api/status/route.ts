import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teamCode = searchParams.get('code');
    
    if (!teamCode) {
      return NextResponse.json({ error: 'Missing team code' }, { status: 400 });
    }
    
    const existing = await kv.hget('live_game_teams', teamCode) as any;
    
    if (!existing || !existing.status) {
       return NextResponse.json({ status: 'active' });
    }
    
    return NextResponse.json({ status: existing.status });
  } catch (error) {
    console.error('KV Status Error:', error);
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
  }
}
