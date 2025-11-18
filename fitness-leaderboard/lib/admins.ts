// lib/admins.ts
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const ADMIN_FILE = path.join(DATA_DIR, "admins.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(ADMIN_FILE)) fs.writeFileSync(ADMIN_FILE, JSON.stringify([]));
}

export async function getAdmins(): Promise<string[]> {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(ADMIN_FILE, "utf8");
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.map((s: string) => s.toLowerCase()) : [];
  } catch {
    return [];
  }
}

export async function addAdmin(email: string) {
  ensureDataDir();
  const admins = await getAdmins();
  const e = email.toLowerCase();
  if (!admins.includes(e)) {
    admins.push(e);
    fs.writeFileSync(ADMIN_FILE, JSON.stringify(admins, null, 2));
  }
  return admins;
}
