import { NextRequest, NextResponse } from 'next/server';
import { allAsync } from '@/lib/sqlite';

// GET /api/lira/logs - paginated interaction logs
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '30');
        const offset = (page - 1) * limit;
        const search = searchParams.get('search') || '';
        const matched = searchParams.get('matched'); // 'true' | 'false' | null (all)
        const dateFrom = searchParams.get('dateFrom');
        const dateTo = searchParams.get('dateTo');

        let where = '1=1';
        const args: any[] = [];

        if (search) {
            where += ' AND LOWER(al.query) LIKE ?';
            args.push(`%${search.toLowerCase()}%`);
        }
        if (matched === 'true') {
            where += ' AND (al.matched_answer_id IS NOT NULL OR al.matched_intent_id IS NOT NULL)';
        } else if (matched === 'false') {
            where += ' AND al.matched_answer_id IS NULL AND al.matched_intent_id IS NULL';
        }
        if (dateFrom) {
            where += ' AND al.created_at >= ?';
            args.push(dateFrom);
        }
        if (dateTo) {
            where += ' AND al.created_at <= ?';
            args.push(dateTo + ' 23:59:59');
        }

        const logs = await allAsync(
            `SELECT al.*, i.intent_name
       FROM assistant_logs al
       LEFT JOIN intents i ON al.matched_intent_id = i.id
       WHERE ${where}
       ORDER BY al.created_at DESC
       LIMIT ? OFFSET ?`,
            [...args, limit, offset]
        );

        const countResult = await allAsync(
            `SELECT COUNT(*) as total FROM assistant_logs al WHERE ${where}`,
            args
        ) as any[];

        return NextResponse.json({
            success: true,
            logs,
            total: countResult[0]?.total || 0,
            page,
            limit
        });
    } catch (error) {
        console.error('Lira logs GET error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch logs' }, { status: 500 });
    }
}
