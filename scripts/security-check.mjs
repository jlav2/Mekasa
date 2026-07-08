#!/usr/bin/env node
// Live security regression check — re-runs (as an anonymous attacker) the
// exact probes used to verify each RLS/trigger fix by hand this session.
// Opt-in only (`npm run security-check`): it creates real anonymous auth users
// on the LINKED Supabase project and best-effort cleans them up via the
// Supabase CLI afterward (falls back to leaving harmless orphan guest rows if
// the CLI is unavailable/unlinked). Requires EXPO_PUBLIC_SUPABASE_URL /
// EXPO_PUBLIC_SUPABASE_ANON_KEY (loaded from .env).
//
// This complements — it does not replace — the Jest unit tests in
// src/store/__tests__, which cover client-side logic without touching the
// network. These checks exercise server-side enforcement (RLS policies,
// triggers, rate limits) that no unit test can reach.
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

function loadEnv() {
  if (!existsSync('.env')) return;
  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}
loadEnv();

const URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
if (!URL || !KEY) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY (check .env).');
  process.exit(1);
}

const createdUserIds = [];
const results = [];

function record(name, pass, detail) {
  results.push({ name, pass });
  console.log(`${pass ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`);
}

function authHeaders(token, extra = {}) {
  return { apikey: KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...extra };
}

async function newAnonUser() {
  const res = await fetch(`${URL}/auth/v1/signup`, {
    method: 'POST',
    headers: { apikey: KEY, 'Content-Type': 'application/json' },
    body: '{}',
  });
  const json = await res.json();
  if (!json.access_token) throw new Error(`anon signup failed: ${JSON.stringify(json)}`);
  createdUserIds.push(json.user.id);
  return { token: json.access_token, uid: json.user.id };
}

// #14 — is_pro is pinned false on insert and unchanged on update, regardless
// of what the client sends.
async function checkIsProSelfGrant() {
  const { token, uid } = await newAnonUser();
  const insertRes = await fetch(`${URL}/rest/v1/profiles`, {
    method: 'POST',
    headers: authHeaders(token, { Prefer: 'return=representation' }),
    body: JSON.stringify({ user_id: uid, name: 'sec-check', avatar_initial: 'S', avatar_color: '#111', is_pro: true, sports: [], home_beaches: [] }),
  });
  const [inserted] = await insertRes.json();
  record('is_pro cannot be self-granted on insert', inserted?.is_pro === false, `is_pro=${inserted?.is_pro}`);

  const updateRes = await fetch(`${URL}/rest/v1/profiles?user_id=eq.${uid}`, {
    method: 'PATCH',
    headers: authHeaders(token, { Prefer: 'return=representation' }),
    body: JSON.stringify({ is_pro: true }),
  });
  const [updated] = await updateRes.json();
  record('is_pro cannot be self-granted on update', updated?.is_pro === false, `is_pro=${updated?.is_pro}`);
}

// #17 — profiles are readable only by their owner.
async function checkProfileIsolation() {
  const a = await newAnonUser();
  const b = await newAnonUser();
  await fetch(`${URL}/rest/v1/profiles`, {
    method: 'POST',
    headers: authHeaders(b.token),
    body: JSON.stringify({ user_id: b.uid, name: 'sec-check-b', avatar_initial: 'B', avatar_color: '#222', sports: [], home_beaches: [] }),
  });
  const readRes = await fetch(`${URL}/rest/v1/profiles?user_id=eq.${b.uid}&select=name`, { headers: authHeaders(a.token) });
  const rows = await readRes.json();
  record("a user cannot read another user's profile", Array.isArray(rows) && rows.length === 0, `rows=${JSON.stringify(rows)}`);
}

// #16 — notifications can only be created for yourself.
async function checkNotificationForge() {
  const a = await newAnonUser();
  const b = await newAnonUser();
  const res = await fetch(`${URL}/rest/v1/notifications`, {
    method: 'POST',
    headers: authHeaders(a.token),
    body: JSON.stringify({ id: `sec-forge-${a.uid}`, kind: 'social', group: 'now', title: 'x', body: 'y', time_label: 'now', user_id: b.uid }),
  });
  record('a user cannot forge a notification for another user', res.status >= 400, `status=${res.status}`);
}

// #15 — chat messages can't spoof another member's sender identity.
async function checkChatSpoof() {
  const a = await newAnonUser();
  const join = await fetch(`${URL}/rest/v1/players`, {
    method: 'POST',
    headers: authHeaders(a.token),
    body: JSON.stringify({ id: `own-gordon:${a.uid}`, circle_id: 'own-gordon', user_id: a.uid, name: 'sec-check', avatar_initial: 'S', avatar_color: '#333', position: 0 }),
  });
  if (join.status !== 201) {
    record('chat sender cannot be spoofed', false, `setup join failed: ${join.status}`);
    return;
  }
  const spoof = await fetch(`${URL}/rest/v1/messages`, {
    method: 'POST',
    headers: authHeaders(a.token),
    body: JSON.stringify({ id: `sec-spoof-${a.uid}`, circle_id: 'own-gordon', kind: 'out', sender_id: 'u-omer', text: 'fake', time_label: 'now' }),
  });
  record('chat sender cannot be spoofed', spoof.status >= 400, `status=${spoof.status}`);
  await fetch(`${URL}/rest/v1/players?id=eq.own-gordon:${a.uid}`, { method: 'DELETE', headers: authHeaders(a.token) });
}

// #34 — a joining client can't impersonate another display name/avatar; the
// trigger overwrites from the joiner's own profile.
async function checkJoinImpersonation() {
  const a = await newAnonUser();
  await fetch(`${URL}/rest/v1/profiles`, {
    method: 'POST',
    headers: authHeaders(a.token),
    body: JSON.stringify({ user_id: a.uid, name: 'sec-check-real-name', avatar_initial: 'S', avatar_color: '#444', sports: [], home_beaches: [] }),
  });
  const res = await fetch(`${URL}/rest/v1/players`, {
    method: 'POST',
    headers: authHeaders(a.token, { Prefer: 'return=representation' }),
    body: JSON.stringify({ id: `own-gordon:${a.uid}`, circle_id: 'own-gordon', user_id: a.uid, name: 'עומר', avatar_initial: 'ע', avatar_color: '#E85413', position: 0 }),
  });
  const [row] = await res.json();
  record('player display name cannot be impersonated on join', row?.name === 'sec-check-real-name', `name=${row?.name}`);
  await fetch(`${URL}/rest/v1/players?id=eq.own-gordon:${a.uid}`, { method: 'DELETE', headers: authHeaders(a.token) });
}

// Closes the login-resolver brute-force oracle: capped at 10/min per IP.
// Consumes real rate-limit budget for the calling IP — don't loop this check.
async function checkLoginResolverRateLimit() {
  let blockedAt = -1;
  for (let i = 1; i <= 12; i++) {
    const res = await fetch(`${URL}/rest/v1/rpc/email_for_username`, {
      method: 'POST',
      headers: { apikey: KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ u: 'sec-check-brute-target', p: `guess-${i}` }),
    });
    if (res.status !== 200) {
      blockedAt = i;
      break;
    }
  }
  record('login resolver rate-limits password guessing (~10/min)', blockedAt > 0 && blockedAt <= 11, `blocked at attempt ${blockedAt}`);
}

async function cleanup() {
  if (createdUserIds.length === 0) return;
  const idList = createdUserIds.map((id) => `'${id}'`).join(',');
  try {
    execSync(
      `npx supabase db query --linked "delete from public.players where user_id in (${idList}); delete from public.waitlist where user_id in (${idList}); delete from public.messages where sender_id in (${idList}); delete from public.notifications where user_id in (${idList}); delete from public.profiles where user_id in (${idList}); delete from public.circles where host_id in (${idList}); delete from auth.users where id::text in (${idList});"`,
      { stdio: 'ignore' },
    );
    console.log(`\ncleaned up ${createdUserIds.length} test user(s) via the Supabase CLI.`);
  } catch {
    console.warn(
      `\ncould not auto-clean ${createdUserIds.length} test user(s) (Supabase CLI unavailable/unlinked) — harmless orphan guest rows remain.`,
    );
  }
}

async function main() {
  try {
    await checkIsProSelfGrant();
    await checkProfileIsolation();
    await checkNotificationForge();
    await checkChatSpoof();
    await checkJoinImpersonation();
    await checkLoginResolverRateLimit();
  } finally {
    await cleanup();
  }
  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
  if (failed.length > 0) process.exit(1);
}

main();
