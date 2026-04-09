import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { teamCode, status } = await req.json();
    if (!teamCode || !status) {
      return NextResponse.json({ error: 'Missing teamCode or status' }, { status: 400 });
    }
    
    // Attempt to merge with existing data
    const existingStr = await kv.hget('live_game_teams', teamCode) as any;
    const existing = existingStr || { code: teamCode };
    
    const updatedTeam = { ...existing, status };
    
    await kv.hset('live_game_teams', { [teamCode]: updatedTeam });
    
    return NextResponse.json({ success: true, teamCode, status });
  } catch (error) {
    console.error('KV Action Error:', error);
    return NextResponse.json({ error: 'Failed to update KV' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teamCode = searchParams.get('teamCode');
    const wipe = searchParams.get('wipe');

    if (wipe === 'true') {
      await kv.del('live_game_teams');
      return NextResponse.json({ success: true, wiped: true });
    }

    if (!teamCode) {
      return NextResponse.json({ error: 'Missing teamCode to delete' }, { status: 400 });
    }

    await kv.hdel('live_game_teams', teamCode);
    return NextResponse.json({ success: true, deletedCode: teamCode });

  } catch (error) {
    console.error('KV Delete Error:', error);
    return NextResponse.json({ error: 'Failed to delete KV data' }, { status: 500 });
  }
}
