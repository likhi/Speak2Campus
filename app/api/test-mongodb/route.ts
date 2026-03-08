import { NextResponse } from 'next/server';
import { getMongoClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    console.log('[v0] Testing MongoDB connection...');
    console.log('[v0] MONGODB_URI env:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
    console.log('[v0] MONGODB_DB env:', process.env.MONGODB_DB || 'speak2campus');

    const client = await getMongoClient();
    console.log('[v0] Client obtained successfully');

    const db = client.db(process.env.MONGODB_DB || 'speak2campus');
    console.log('[v0] Database selected');

    const result = await db.admin().ping();
    console.log('[v0] Ping result:', result);

    return NextResponse.json(
      {
        success: true,
        message: 'MongoDB connection successful',
        database: process.env.MONGODB_DB || 'speak2campus',
        ping: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] MongoDB test error:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
        env: {
          mongodb_uri: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
          mongodb_db: process.env.MONGODB_DB || 'speak2campus',
        },
      },
      { status: 500 }
    );
  }
}
