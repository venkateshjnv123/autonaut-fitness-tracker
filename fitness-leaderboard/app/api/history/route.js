// app/api/history/route.js
import { getUserHistory } from '../../../../lib/redis';

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const email = (url.searchParams.get('email') || '').toLowerCase();
    if (!email) return new Response(JSON.stringify({ error: 'Missing email' }), { status: 400 });

    const history = await getUserHistory(email);
    return new Response(JSON.stringify({ email, history }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
