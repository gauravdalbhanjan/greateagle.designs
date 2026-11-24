/* GET /api/availability
   Returns the schedule config and BUSY intervals only, clipped to working
   hours. No event titles, descriptions, attendees or locations ever leave
   this function. Google's free/busy API doesn't provide them anyway. */
'use strict';
const { CONFIG, windows, busy, send, originOk } = require('./_booking/core.js');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' }, { Allow: 'GET' });
  if (!originOk(req)) return send(res, 403, { error: 'Forbidden' });
  try {
    const now = new Date();
    const wins = windows(now);
    if (!wins.length) return send(res, 200, { config: publicConfig(), busy: [] });
    const all = await busy(wins[0].start, wins[wins.length - 1].end);
    // Clip each busy block to working hours, so nothing outside them is revealed.
    const clipped = [];
    for (const w of wins) for (const b of all) {
      const s = Math.max(w.start.getTime(), b.start.getTime()), e = Math.min(w.end.getTime(), b.end.getTime());
      if (e > s) clipped.push({ start: new Date(s).toISOString(), end: new Date(e).toISOString() });
    }
    send(res, 200, { config: publicConfig(), busy: clipped }, { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' });
  } catch (err) {
    console.error('availability:', err.message);
    send(res, 503, { error: 'Availability is temporarily unavailable' }, { 'Cache-Control': 'no-store' });
  }
};

function publicConfig() {
  const { tz, days, startHour, endHour, slotMinutes, minNoticeHours, horizonDays } = CONFIG;
  return { tz, days, startHour, endHour, slotMinutes, minNoticeHours, horizonDays };
}
