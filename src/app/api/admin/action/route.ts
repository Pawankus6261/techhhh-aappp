import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { teamCode, status } = await req.json();
    if (!teamCode || !status) {
      return NextResponse.json({ error: 'Missing teamCode or status' }, { status: 400 });
    }
    
    await kv.set(`team_status_${teamCode}`, status);
    
    return NextResponse.json({ success: true, teamCode, status });
  } catch (error) {
    console.error('KV Action Error:', error);
    return NextResponse.json({ error: 'Failed to update KV' }, { status: 500 });
  }
}
