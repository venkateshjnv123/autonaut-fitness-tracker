// app/api/add-score/route.js
import { log } from 'console';
import { addScore, setUserProfile } from '../../../../lib/redis';

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, name, picture, score, date } = body;
    log('POST /api/app-score', { email, name, picture, score, date });
    if (!email || !date || typeof score === 'undefined') {
      return new Response(JSON.stringify({ error: 'Missing email/date/score' }), { status: 400 });
    }

    // Save profile (idempotent)
    await setUserProfile(email.toLowerCase(), {
      name: name || '',
      picture: picture || '',
      role: 'user',
    });

    await addScore(date, Number(score), email.toLowerCase());

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
