/* One-time helper: get a Google refresh token for the booking functions.
   Runs on your computer only. Never deploy this folder (.vercelignore).

   1. In Google Cloud Console → APIs & Services:
      • Enable "Google Calendar API".
      • OAuth client (Web) → Authorized redirect URIs → add
          http://localhost:53682/oauth2callback
      • OAuth consent screen: add your Google account as a test user
        (or publish the app) so the refresh token doesn't expire in 7 days.
   2. Run:  node scripts/google-calendar-token.mjs path/to/client_secret_….json
   3. Open the printed URL, sign in, allow access.
   4. Copy the printed values into Vercel → Project → Settings →
      Environment Variables (Production):
        GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
      Then redeploy.

   Scopes: read free/busy, and create/list events on your calendar. */
import http from 'node:http';
import fs from 'node:fs';
import crypto from 'node:crypto';

// Optional flags:
//   --env <file>       write GOOGLE_CLIENT_ID / _SECRET / _REFRESH_TOKEN to <file>
//                      (e.g. .env.local, which git and Vercel ignore) instead of printing
//   --url-file <file>  also write the sign-in URL to <file>
const args = process.argv.slice(2);
const flag = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const ENV_OUT = flag('--env'), URL_OUT = flag('--url-file');
const file = args.find((a, i) => !a.startsWith('--') && !['--env', '--url-file'].includes(args[i - 1]));
if (!file) { console.error('Usage: node scripts/google-calendar-token.mjs <client_secret.json> [--env .env.local] [--url-file auth-url.txt]'); process.exit(1); }
const json = JSON.parse(fs.readFileSync(file, 'utf8'));
const c = json.web || json.installed;
const REDIRECT = 'http://localhost:53682/oauth2callback';
const SCOPES = ['https://www.googleapis.com/auth/calendar.freebusy', 'https://www.googleapis.com/auth/calendar.events'];
const state = crypto.randomBytes(16).toString('hex');

const url = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
  client_id: c.client_id, redirect_uri: REDIRECT, response_type: 'code', scope: SCOPES.join(' '),
  access_type: 'offline', prompt: 'consent', state
});

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, REDIRECT);
  if (u.pathname !== '/oauth2callback') { res.writeHead(404).end(); return; }
  if (u.searchParams.get('state') !== state) { res.writeHead(400).end('State mismatch'); return; }
  const code = u.searchParams.get('code');
  if (!code) { res.writeHead(400).end('No code: ' + (u.searchParams.get('error') || '')); return; }
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id: c.client_id, client_secret: c.client_secret, redirect_uri: REDIRECT, grant_type: 'authorization_code' })
  });
  const t = await r.json();
  const granted = String(t.scope || '').split(' ');
  const missing = SCOPES.filter(s => !granted.includes(s));
  if (t.refresh_token && missing.length) {
    res.writeHead(200, { 'Content-Type': 'text/plain' }).end('Not saved: some access was left unticked. Open the sign-in link again and tick every checkbox.');
    console.error('\nNot saved: Google granted only part of the access. Missing: ' + missing.join(', ') +
      '\nRun again and tick EVERY checkbox on the consent screen (free/busy AND events).');
    server.close(); return;
  }
  res.writeHead(200, { 'Content-Type': 'text/plain' }).end(t.refresh_token ? 'Done. You can close this tab and return to the terminal.' : 'No refresh token returned. See the terminal.');
  if (!t.refresh_token) { console.error('\nNo refresh_token in the response:', t.error || t); }
  else if (ENV_OUT) {
    fs.writeFileSync(ENV_OUT, 'GOOGLE_CLIENT_ID=' + c.client_id + '\nGOOGLE_CLIENT_SECRET=' + c.client_secret + '\nGOOGLE_REFRESH_TOKEN=' + t.refresh_token + '\n', { mode: 0o600 });
    console.log('\nSaved GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REFRESH_TOKEN to ' + ENV_OUT + ' (values not printed).');
  } else {
    console.log('\nAdd these to Vercel → Settings → Environment Variables (Production), then redeploy:\n');
    console.log('GOOGLE_CLIENT_ID=' + c.client_id);
    console.log('GOOGLE_CLIENT_SECRET=<the client_secret value from your JSON file>');
    console.log('GOOGLE_REFRESH_TOKEN=' + t.refresh_token);
    console.log('\nKeep these private. Do not commit them or paste them into chat.');
  }
  server.close();
});
server.listen(53682, 'localhost', () => {
  if (URL_OUT) fs.writeFileSync(URL_OUT, url + '\n');
  console.log('Open this URL in your browser and allow access:\n\n' + url + '\n');
});
