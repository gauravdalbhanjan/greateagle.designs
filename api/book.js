/* POST /api/book  { start, name, email, topic?, website?, tz? }
   Re-checks the slot against free/busy, then creates a 30-minute event on
   the owner's calendar with a Google Meet link and invites the visitor.
   Abuse limits: honeypot, strict slot validation, per-IP rate limit
   (best effort, per instance), and a cap on bookings per day. */
'use strict';
const { CONFIG, CALENDAR_ID, isValidSlot, partsIn, zoned, busy, google, send, originOk, clientIp } = require('./_booking/core.js');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const hits = new Map();   // ip → [timestamps]
function rateLimited(ip) {
  const now = Date.now(), recent = (hits.get(ip) || []).filter(t => now - t < 3600000);
  recent.push(now); hits.set(ip, recent);
  return recent.length > 5;
}
const clean = (s, max) => String(s || '').replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, max);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' }, { Allow: 'POST' });
  if (!originOk(req)) return send(res, 403, { error: 'Forbidden' });
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = null; } }
  if (!b || typeof b !== 'object') return send(res, 400, { error: 'Invalid request' });

  if (b.website) return send(res, 201, { ok: true });                  // honeypot: silently drop
  const name = clean(b.name, 80), email = clean(b.email, 120).toLowerCase(), topic = clean(b.topic, 500);
  if (!name) return send(res, 400, { error: 'Add your name.' });
  if (!EMAIL_RE.test(email)) return send(res, 400, { error: 'Enter a valid email.' });
  const now = new Date(), start = new Date(b.start);
  if (!isValidSlot(start, now)) return send(res, 400, { error: 'That time isn\u2019t available. Please pick another slot.' });
  if (rateLimited(clientIp(req))) return send(res, 429, { error: 'Too many booking attempts. Please try again later.' });

  const end = new Date(start.getTime() + CONFIG.slotMinutes * 60000);
  try {
    // 1. Still free?
    const taken = (await busy(start, end)).some(x => x.start < end && x.end > start);
    if (taken) return send(res, 409, { error: 'That slot was just taken. Please pick another.' });

    // 2. Daily cap (counts only events created by this booking form).
    const p = partsIn(start, CONFIG.tz);
    const dayStart = zoned(p.y, p.m, p.d, 0, 0, CONFIG.tz), dayEnd = zoned(p.y, p.m, p.d + 1, 0, 0, CONFIG.tz);
    const q = new URLSearchParams({ timeMin: dayStart.toISOString(), timeMax: dayEnd.toISOString(), privateExtendedProperty: 'gedBooking=1', singleEvents: 'true', maxResults: '50' });
    const existing = await google('/calendars/' + encodeURIComponent(CALENDAR_ID) + '/events?' + q);
    if ((existing.items || []).length >= CONFIG.maxBookingsPerDay) return send(res, 409, { error: 'That day is fully booked. Please pick another day.' });

    // 3. Create the event and email the invite (Google sends it).
    const event = {
      summary: '30-min session \u00b7 ' + name,
      description: 'Booked via greateagledesigns.com' + (topic ? '\n\nTopic: ' + topic : '') + (b.tz ? '\nVisitor time zone: ' + clean(b.tz, 64) : ''),
      start: { dateTime: start.toISOString(), timeZone: CONFIG.tz },
      end: { dateTime: end.toISOString(), timeZone: CONFIG.tz },
      attendees: [{ email, displayName: name }],
      guestsCanSeeOtherGuests: false,
      guestsCanInviteOthers: false,
      conferenceData: { createRequest: { requestId: 'ged-' + start.getTime() + '-' + Math.random().toString(36).slice(2, 10), conferenceSolutionKey: { type: 'hangoutsMeet' } } },
      extendedProperties: { private: { gedBooking: '1' } }
    };
    await google('/calendars/' + encodeURIComponent(CALENDAR_ID) + '/events?conferenceDataVersion=1&sendUpdates=all', { method: 'POST', body: JSON.stringify(event) });
    send(res, 201, { ok: true, start: start.toISOString(), end: end.toISOString() }, { 'Cache-Control': 'no-store' });
  } catch (err) {
    console.error('book:', err.message);
    send(res, 503, { error: 'Booking is temporarily unavailable. Please try again or send a message.' }, { 'Cache-Control': 'no-store' });
  }
};
