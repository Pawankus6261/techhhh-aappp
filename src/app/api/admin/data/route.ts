import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const allTeams = await kv.hgetall('live_game_teams');
    
    if (!allTeams) {
      return NextResponse.json({ teams: [] });
    }
    
    const teamsList = Object.values(allTeams);
    return NextResponse.json({ teams: teamsList });
  } catch (error) {
    console.error('KV Data Error:', error);
    return NextResponse.json({ error: 'Failed to fetch Admin Database' }, { status: 500 });
  }
}
