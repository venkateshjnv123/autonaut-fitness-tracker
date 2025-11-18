// app/api/admins/route.ts
import { NextRequest } from "next/server";
import { addAdmin } from "../../../lib/admins";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret") || process.env.ADMIN_PANEL_SECRET;
  if (!secret || secret !== process.env.ADMIN_PANEL_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const { email } = await req.json();
  if (!email) {
    return new Response(JSON.stringify({ error: "Missing email" }), { status: 400 });
  }
  try {
    const admins = await addAdmin(email);
    return new Response(JSON.stringify({ ok: true, admins }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
