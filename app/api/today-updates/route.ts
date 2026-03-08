import { NextResponse } from 'next/server';
import { allAsync } from '@/lib/sqlite';

/**
 * Returns today's date as YYYY-MM-DD in IST (UTC+5:30).
 * We always compute on the server so the voice-assistant response
 * is consistent regardless of the client's timezone.
 */
function getTodayIST(): string {
    const now = new Date();
    // Shift to IST = UTC + 5h30m
    const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    return ist.toISOString().split('T')[0]; // "YYYY-MM-DD"
}

/**
 * Build a natural-language spoken response from the DB results.
 * Follows the response-format rules in the system prompt:
 *   1. Announcements first (sorted high → low priority)
 *   2. Then events
 *   3. Combined intelligently
 *   4. Nothing → polite "none today" message
 */
function buildSpokenResponse(announcements: any[], events: any[]): string {
    const hasA = announcements.length > 0;
    const hasE = events.length > 0;

    if (!hasA && !hasE) {
        return 'There are no announcements or events scheduled for today.';
    }

    const parts: string[] = [];

    // ── Announcements section ──────────────────────────────────────────────────
    if (hasA) {
        const count = announcements.length;
        const intro =
            count === 1
                ? 'There is 1 announcement today.'
                : `There are ${count} announcements today.`;

        const ordinals = ['First', 'Second', 'Third', 'Fourth', 'Fifth'];
        const items = announcements.map((a, i) => {
            const prefix = count === 1 ? '' : `${ordinals[i] ?? String(i + 1) + 'th'}, `;
            const body = a.content ? `${a.title}: ${a.content}` : a.title;
            return `${prefix}${body}.`;
        });

        parts.push(`${intro} ${items.join(' ')}`);
    }

    // ── Events section ─────────────────────────────────────────────────────────
    if (hasE) {
        const count = events.length;
        const connector = hasA ? 'Additionally, there' : 'There';

        if (count === 1) {
            const e = events[0];
            const time = e.event_time ? ` at ${e.event_time}` : '';
            const venue = e.venue ? ` in ${e.venue}` : '';
            parts.push(`${connector} is 1 event today: ${e.name}${time}${venue}.`);
        } else {
            const list = events
                .map((e) => `${e.name}${e.event_time ? ' at ' + e.event_time : ''}`)
                .join(', and ');
            parts.push(
                `${connector} are ${count} events scheduled today: ${list}.`
            );
        }
    }

    return parts.join(' ');
}

// GET /api/today-updates
export async function GET() {
    try {
        const today = getTodayIST();

        // Active announcements for today, ordered high → medium → low
        const announcements = await allAsync(
            `SELECT * FROM announcements
       WHERE announcement_date = ? AND active_status = 1
       ORDER BY
         CASE priority
           WHEN 'high'   THEN 1
           WHEN 'medium' THEN 2
           WHEN 'low'    THEN 3
           ELSE 4
         END`,
            [today]
        );

        // Events for today, ordered by event_time (nulls last)
        const events = await allAsync(
            `SELECT * FROM events
       WHERE date = ?
       ORDER BY COALESCE(event_time, '99:99') ASC`,
            [today]
        );

        const spoken_response = buildSpokenResponse(announcements, events);

        return NextResponse.json({
            intent: 'get_today_updates',
            date: today,
            announcements_count: announcements.length,
            events_count: events.length,
            announcements,
            events,
            spoken_response,
        });
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        console.error('[today-updates] Error:', error);
        return NextResponse.json(
            { error: `Failed to fetch today's updates: ${msg}` },
            { status: 500 }
        );
    }
}
