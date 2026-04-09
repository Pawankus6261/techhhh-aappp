import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const team = await req.json();
    if (!team || !team.code) {
      return NextResponse.json({ error: 'Missing team data' }, { status: 400 });
    }
    
    // Check if team already exists to preserve status unless provided
    const existing = await kv.hget('live_game_teams', team.code) as any;
    const teamToSave = { ...existing, ...team };
    
    await kv.hset('live_game_teams', { [team.code]: teamToSave });
    
    return NextResponse.json({ success: true, team: teamToSave });
  } catch (error) {
    console.error('KV Sync Error:', error);
    return NextResponse.json({ error: 'Failed to sync team' }, { status: 500 });
  }
}
