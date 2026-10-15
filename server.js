// Los Bursa çok oyunculu sunucu (WebSocket aktarıcı)
const http = require('http');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 8080;
// Sadece bu siteler bağlanabilsin (virgülle ayır). Boşsa herkes bağlanabilir.
// Örnek: ALLOWED_ORIGINS=https://kullanici.github.io
const ALLOWED = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
const MAX_PLAYERS = 40;
const KEYS = new Set(['o', 'id', 'w', 'n', 'x', 'z', 'r', 'ic', 'cx', 'cz', 'cr', 'ct', 'cc', 'hp', 'ev']);

const clients = new Map();
const dirty = new Set();
let nextId = 1;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
  res.end('Los Bursa sunucusu çalışıyor. Çevrimiçi oyuncu: ' + clients.size);
});
const wss = new WebSocketServer({ server, maxPayload: 8192 });

function send(c, s) { if (c.ws.readyState === 1) c.ws.send(s); }

wss.on('connection', (ws, req) => {
  const origin = req.headers.origin;
  if (ALLOWED.length && !ALLOWED.includes(origin)) { ws.close(1008, 'origin'); return; }
  if (clients.size >= MAX_PLAYERS) { ws.close(1013, 'full'); return; }

  const id = 'p' + (nextId++).toString(36) + Math.random().toString(36).slice(2, 5);
  const c = { ws, presence: {}, msgs: 0, alive: true };
  clients.set(id, c);

  const others = [...clients].filter(([k]) => k !== id).map(([k, v]) => ({ peer: k, presence: v.presence }));
  send(c, JSON.stringify({ t: 'hello', id, peers: others }));

  ws.on('pong', () => { c.alive = true; });
  ws.on('message', buf => {
    if (++c.msgs > 120) return; // saniyede en fazla 120 mesaj
    let m;
    try { m = JSON.parse(buf.toString()); } catch (e) { return; }
    if (!m || m.t !== 'p' || typeof m.d !== 'object' || !m.d) return;
    for (const k of Object.keys(m.d)) {
      if (!KEYS.has(k)) continue;
      const val = m.d[k];
      if (JSON.stringify(val).length <= 1500) c.presence[k] = val;
    }
    dirty.add(id);
  });
  ws.on('close', () => {
    clients.delete(id);
    dirty.delete(id);
    const s = JSON.stringify({ t: 'l', peer: id });
    for (const o of clients.values()) send(o, s);
  });
  ws.on('error', () => {});
});

// Değişen oyuncuları saniyede 20 kez toplu gönder
setInterval(() => {
  if (!dirty.size) return;
  const list = [...dirty].filter(k => clients.has(k)).map(k => ({ peer: k, presence: clients.get(k).presence }));
  dirty.clear();
  const s = JSON.stringify({ t: 'u', list });
  for (const c of clients.values()) send(c, s);
}, 50);

setInterval(() => { for (const c of clients.values()) c.msgs = 0; }, 1000);
setInterval(() => {
  for (const c of clients.values()) {
    if (!c.alive) { c.ws.terminate(); continue; }
    c.alive = false;
    try { c.ws.ping(); } catch (e) {}
  }
}, 30000);

server.listen(PORT, () => console.log('Los Bursa sunucusu dinliyor: ' + PORT));
