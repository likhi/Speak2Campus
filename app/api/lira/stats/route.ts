import { NextRequest, NextResponse } from 'next/server';
import { allAsync, getAsync } from '@/lib/sqlite';

// GET /api/lira/stats - analytics data for admin dashboard
export async function GET(_request: NextRequest) {
    try {
        // Total queries
        const totalResult = await getAsync('SELECT COUNT(*) as total FROM assistant_logs') as any;
        const total = totalResult?.total || 0;

        // Matched queries
        const matchedResult = await getAsync(
            'SELECT COUNT(*) as matched FROM assistant_logs WHERE matched_answer_id IS NOT NULL OR matched_intent_id IS NOT NULL'
        ) as any;
        const matched = matchedResult?.matched || 0;

        // Avg confidence
        const avgResult = await getAsync(
            'SELECT AVG(confidence) as avg_conf FROM assistant_logs WHERE confidence > 0'
        ) as any;
        const avgConfidence = Math.round((avgResult?.avg_conf || 0) * 100);

        // Top intents (by matched_intent_id)
        const topIntents = await allAsync(`
      SELECT i.intent_name, COUNT(al.id) as count
      FROM assistant_logs al
      JOIN intents i ON al.matched_intent_id = i.id
      GROUP BY al.matched_intent_id
      ORDER BY count DESC
      LIMIT 8
    `) as any[];

        // Queries by hour (last 24h)
        const queriesByHour = await allAsync(`
      SELECT strftime('%H', created_at) as hour, COUNT(*) as count
      FROM assistant_logs
      WHERE created_at >= datetime('now', '-24 hours')
      GROUP BY strftime('%H', created_at)
      ORDER BY hour ASC
    `) as any[];

        // Queries last 7 days
        const queriesByDay = await allAsync(`
      SELECT strftime('%Y-%m-%d', created_at) as day, COUNT(*) as count
      FROM assistant_logs
      WHERE created_at >= datetime('now', '-7 days')
      GROUP BY strftime('%Y-%m-%d', created_at)
      ORDER BY day ASC
    `) as any[];

        // Top unmatched queries (for training insights)
        const unmatchedQueries = await allAsync(`
      SELECT query, COUNT(*) as count
      FROM assistant_logs
      WHERE matched_answer_id IS NULL AND matched_intent_id IS NULL
      GROUP BY query
      ORDER BY count DESC
      LIMIT 10
    `) as any[];

        // Recent activity (last 5)
        const recentLogs = await allAsync(
            'SELECT query, confidence, created_at, session_id FROM assistant_logs ORDER BY created_at DESC LIMIT 5'
        ) as any[];

        return NextResponse.json({
            success: true,
            stats: {
                totalQueries: total,
                matchedQueries: matched,
                unmatchedQueries: total - matched,
                matchRate: total > 0 ? Math.round((matched / total) * 100) : 0,
                avgConfidence,
                topIntents,
                queriesByHour,
                queriesByDay,
                topUnmatched: unmatchedQueries,
                recentActivity: recentLogs
            }
        });
    } catch (error) {
        console.error('Lira stats GET error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
    }
}
