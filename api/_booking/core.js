/* Shared server-side helpers for /api/availability and /api/book.
   Underscore folder: Vercel does not expose it as an endpoint.
   Secrets come ONLY from environment variables (set in Vercel):
     GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
     BOOKING_CALENDAR_ID   (optional, default "primary")
   No dependencies: uses Node's built-in fetch and Intl. */
'use strict';

// Working schedule. Mirrors the site copy: Mon–Fri, 8am–6pm PT.
const CONFIG = {
  tz: process.env.BOOKING_TZ || 'America/Los_Angeles',
  days: [1, 2, 3, 4, 5],     // 0 = Sunday
  startHour: 8,
  endHour: 18,
  slotMinutes: 30,
  minNoticeHours: 12,
  horizonDays: 14,
  maxBookingsPerDay: 6
};
const CALENDAR_ID = process.env.BOOKING_CALENDAR_ID || 'primary';
const ALLOWED_ORIGINS = ['https://greateagledesigns.com', 'https://www.greateagledesigns.com', 'http://localhost:3000'];

/* ── Time zone math ── */
function tzOffset(date, tz) {
  const p = {};
  new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    .formatToParts(date).forEach(x => { p[x.type] = x.value; });
  return (Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second) - date.getTime()) / 60000;
}
function zoned(y, m, d, h, mi, tz) {
  const guess = Date.UTC(y, m, d, h, mi);
  const t = guess - tzOffset(new Date(guess), tz) * 60000;
  return new Date(guess - tzOffset(new Date(t), tz) * 60000);
}
function partsIn(date, tz) {
  const p = {};
  new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', weekday: 'short' })
    .formatToParts(date).forEach(x => { p[x.type] = x.value; });
  const wd = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[p.weekday];
  return { y: +p.year, m: +p.month - 1, d: +p.day, h: +p.hour % 24, mi: +p.minute, wd };
}
/** Working-hour windows [{start,end}] from today through the horizon. */
function windows(now) {
  const t = partsIn(now, CONFIG.tz), out = [];
  for (let i = 0; i <= CONFIG.horizonDays; i++) {
    const day = new Date(Date.UTC(t.y, t.m, t.d + i));
    if (!CONFIG.days.includes(day.getUTCDay())) continue;
    const Y = day.getUTCFullYear(), M = day.getUTCMonth(), D = day.getUTCDate();
    out.push({ start: zoned(Y, M, D, CONFIG.startHour, 0, CONFIG.tz), end: zoned(Y, M, D, CONFIG.endHour, 0, CONFIG.tz) });
  }
  return out;
}
/** True if `start` is a real bookable slot (aligned, in hours, in range, enough notice). */
function isValidSlot(start, now) {
  if (!(start instanceof Date) || isNaN(start)) return false;
  if (start.getTime() < now.getTime() + CONFIG.minNoticeHours * 3600000) return false;
  if (start.getTime() > now.getTime() + (CONFIG.horizonDays + 1) * 86400000) return false;
  const p = partsIn(start, CONFIG.tz);
  if (!CONFIG.days.includes(p.wd)) return false;
  const mins = p.h * 60 + p.mi;
  if (mins % CONFIG.slotMinutes !== 0) return false;
  if (start.getUTCSeconds() || start.getUTCMilliseconds()) return false;
  return mins >= CONFIG.startHour * 60 && mins + CONFIG.slotMinutes <= CONFIG.endHour * 60;
}

/* ── Google APIs ── */
let cachedToken = null;
async function accessToken() {
  if (cachedToken && cachedToken.exp > Date.now() + 60000) return cachedToken.value;
  const { GOOGLE_CLIENT_ID: id, GOOGLE_CLIENT_SECRET: secret, GOOGLE_REFRESH_TOKEN: refresh } = process.env;
  if (!id || !secret || !refresh) throw new Error('Google credentials are not configured');
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: id, client_secret: secret, refresh_token: refresh, grant_type: 'refresh_token' })
  });
  if (!r.ok) throw new Error('token refresh failed: ' + r.status);
  const j = await r.json();
  cachedToken = { value: j.access_token, exp: Date.now() + (j.expires_in || 3000) * 1000 };
  return cachedToken.value;
}
async function google(path, opts = {}) {
  const token = await accessToken();
  const r = await fetch('https://www.googleapis.com/calendar/v3' + path, {
    ...opts, headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', ...(opts.headers || {}) }
  });
  if (!r.ok) throw new Error('calendar api ' + r.status + ' ' + path.split('?')[0]);
  return r.json();
}
/** Busy intervals only. The free/busy API never returns titles or details. */
async function busy(timeMin, timeMax) {
  const j = await google('/freeBusy', {
    method: 'POST',
    body: JSON.stringify({ timeMin: timeMin.toISOString(), timeMax: timeMax.toISOString(), items: [{ id: CALENDAR_ID }] })
  });
  const cal = j.calendars && j.calendars[CALENDAR_ID];
  if (!cal || (cal.errors && cal.errors.length)) throw new Error('free/busy unavailable');
  return (cal.busy || []).map(b => ({ start: new Date(b.start), end: new Date(b.end) }));
}

/* ── HTTP helpers ── */
function send(res, status, body, headers = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
  res.end(JSON.stringify(body));
}
function originOk(req) {
  const o = req.headers.origin;
  if (!o) return true;                        // same-origin GETs may omit Origin
  if (ALLOWED_ORIGINS.includes(o)) return true;
  // Same-origin check: the page and this function share a host (covers
  // Vercel preview URLs). Cross-site requests from other hosts are refused.
  try {
    const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
    return !!host && new URL(o).host === host;
  } catch (e) { return false; }
}
function clientIp(req) {
  return String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
}

module.exports = { CONFIG, CALENDAR_ID, windows, isValidSlot, partsIn, zoned, busy, google, send, originOk, clientIp };
