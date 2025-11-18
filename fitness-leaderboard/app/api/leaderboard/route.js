// app/api/leaderboard/today/route.js
import { getTodayLeaderboard, getUserProfile } from '../../../../../lib/redis';

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const date = url.searchParams.get('date') || new Date().toISOString().slice(0,10);
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);

    const rows = await getTodayLeaderboard(date, 0, limit - 1);

    // attach user profile for name & picture
    const enhanced = await Promise.all(rows.map(async (r, idx) => {
      const prof = await getUserProfile(r.member);
      return {
        rank: idx + 1,
        email: r.member,
        score: r.score,
        name: prof?.name || r.member,
        picture: prof?.picture || null
      };
    }));
    return new Response(JSON.stringify({ date, board: enhanced }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
