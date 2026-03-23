/**
* Aurora Gaming Match Tracker
* Powered by Liquipedia API (api.liquipedia.net)
* Data provided by Liquipedia (liquipedia.net) — please support them!
*/

const https = require('https');

const API_KEY = process.env.LIQUIPEDIA_API_KEY;
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!API_KEY) { console.error('Set LIQUIPEDIA_API_KEY'); process.exit(1); }

const WIKIS = ['counterstrike', 'dota2', 'mobilelegends'];
const WIKI_NAMES = { counterstrike: 'CS2', dota2: 'Dota 2', mobilelegends: 'MLBB' };
const TEAM = 'Aurora';

function request(hostname, path, headers) {
return new Promise((resolve, reject) => {
const req = https.get({ hostname, path, headers }, (res) => {
let data = '';
res.on('data', chunk => data += chunk);
res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(data) }); } catch (e) { reject(e); } });
});
req.on('error', reject);
req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
});
}

function formatDate(d) {
if (!d) return 'TBD';
return new Date(d).toLocaleString('ru-RU', { timeZone: 'Asia/Nicosia', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

async function getMatches(wiki) {
const today = new Date().toISOString().split('T')[0];
const params = new URLSearchParams({ wiki, conditions: `[[opponent::${TEAM}]] AND [[date::>${today}]]`, order: 'date ASC', limit: '5' });
const res = await request('api.liquipedia.net', `/api/v3/match?${params}`, {
'Authorization': `Apikey ${API_KEY}`,
'Accept': 'application/json',
'User-Agent': 'AuroraMatchTracker/1.0 (github.com/tsobolevsky/aurora-match-tracker)',
});
if (res.status !== 200) return [];
return (res.body.result || []).map(m => {
const o = m.match2opponents || [];
return { date: formatDate(m.date), team1: o[0]?.name || '?', team2: o[1]?.name || '?', tournament: m.tournament || '—' };
});
}

async function sendTelegram(text) {
if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) { console.log(text); return; }
const body = JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'HTML' });
return new Promise((resolve, reject) => {
const req = https.request({ hostname: 'api.telegram.org', path: `/bot${TELEGRAM_TOKEN}/sendMessage`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } }, res => { res.resume(); resolve(); });
req.on('error', reject);
req.write(body); req.end();
});
}

async function main() {
const lines = ['🎮 <b>Aurora Gaming — ближайшие матчи</b>', ''];
let hasMatches = false;
for (const wiki of WIKIS) {
try {
const matches = await getMatches(wiki);
if (!matches.length) continue;
hasMatches = true;
lines.push(`🔹 <b>${WIKI_NAMES[wiki]}</b>`);
for (const m of matches) { lines.push(` ${m.date} | ${m.team1} vs ${m.team2}`); lines.push(` 📍 ${m.tournament}`); }
lines.push('');
} catch (e) { lines.push(`⚠️ ${WIKI_NAMES[wiki]}: ${e.message}`); }
}
if (!hasMatches) lines.push('Матчей не найдено.');
lines.push('\n<i>Data by <a href="https://liquipedia.net">Liquipedia</a></i>');
await sendTelegram(lines.join('\n'));
}

main().catch(console.error);
