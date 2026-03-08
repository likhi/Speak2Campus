import { NextRequest, NextResponse } from 'next/server';
import { allAsync } from '@/lib/sqlite';

export async function GET(request: NextRequest) {
  try {
    const rows = await allAsync('SELECT * FROM knowledge_base ORDER BY created_at DESC');
    return NextResponse.json(rows || []);
  } catch (error) {
    console.error('Error fetching knowledge base:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
