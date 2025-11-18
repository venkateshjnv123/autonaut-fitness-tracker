// lib/clientAuth.ts
export type LocalUser = {
  email: string;
  name?: string;
  picture?: string;
  role?: string;
  token?: string;
};

const KEY = 'ft_user_v2';

export function saveLocalUser(u: LocalUser) {
  try {
    localStorage.setItem(KEY, JSON.stringify(u));
  } catch {}
}

export function getLocalUser(): LocalUser | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as LocalUser) : null;
  } catch {
    return null;
  }
}

export function clearLocalUser() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
