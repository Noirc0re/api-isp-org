import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import maxmind from 'maxmind';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// --- Database Configuration ---
const dataDir = join(__dirname, '..', 'data');

// MaxMind (MMDB)
let cityLookup = null;
let asnLookup = null;

// IP2Location / IP2Proxy (CSV)
let ipProxyDatabase = [];
let ipLocationDatabase = [];
const proxyDbPath = join(dataDir, 'IP2PROXY-LITE-PX12.CSV/IP2PROXY-LITE-PX12.CSV');
const locationDbPath = join(dataDir, 'IP2LOCATION-LITE-DB11.CSV/IP2LOCATION-LITE-DB11.CSV');

// --- Helper Functions for CSV Databases ---
async function loadIPDatabase(dbPath, columns) {
  if (!fs.existsSync(dbPath)) {
    return [];
  }
  return new Promise((resolve, reject) => {
    const db = [];
    const fileStream = fs.createReadStream(dbPath, { encoding: 'utf8' });
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    rl.on('line', (line) => {
      const parts = line.split(',').map(p => p.replace(/"/g, ''));
      if (parts.length < 2) return;
      const entry = new Array(columns.length + 2);
      entry[0] = BigInt(parts[0]); // ipFrom
      entry[1] = BigInt(parts[1]); // ipTo
      for (let i = 0; i < columns.length; i++) {
        entry[i + 2] = parts[i + 2] === '-' ? null : parts[i + 2];
      }
      db.push(entry);
    });

    rl.on('close', () => {
      db.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
      resolve(db);
    });

    rl.on('error', reject);
    fileStream.on('error', reject);
  });
}

function ipToNumber(ip) {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  for (const part of parts) {
    const num = parseInt(part, 10);
    if (isNaN(num) || num < 0 || num > 255) return null;
  }
  return BigInt(
    (parseInt(parts[0], 10) * 16777216) +
    (parseInt(parts[1], 10) * 65536) +
    (parseInt(parts[2], 10) * 256) +
    parseInt(parts[3], 10)
  );
}

function lookupIP(ipNum, db) {
  if (!db || db.length === 0) return null;
  let left = 0;
  let right = db.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const entry = db[mid];
    if (ipNum >= entry[0] && ipNum <= entry[1]) return entry;
    if (ipNum < entry[0]) right = mid - 1;
    else left = mid + 1;
  }
  return null;
}

// --- Initialize Databases ---
async function initDatabases() {
  console.log('🔄 Initializing databases...');

  // Load MaxMind
  try {
    const cityPath = join(dataDir, 'GeoLite2-City.mmdb');
    const asnPath = join(dataDir, 'GeoLite2-ASN.mmdb');
    if (fs.existsSync(cityPath)) cityLookup = await maxmind.open(cityPath);
    if (fs.existsSync(asnPath)) asnLookup = await maxmind.open(asnPath);
    if (cityLookup) console.log('✅ MaxMind City database loaded');
    if (asnLookup) console.log('✅ MaxMind ASN database loaded');
  } catch (error) {
    console.error('❌ Failed to load MaxMind databases:', error.message);
  }

  // Load IP2Proxy
  try {
    if (fs.existsSync(proxyDbPath)) {
      console.log('⏳ Loading IP2Proxy CSV...');
      ipProxyDatabase = await loadIPDatabase(proxyDbPath, [
        'proxyType', 'countryCode', 'countryName', 'regionName', 'cityName', 'isp', 'domain', 'usageType', 'asn', 'as', 'lastSeen', 'threat', 'provider'
      ]);
      console.log(`✅ IP2Proxy CSV loaded: ${ipProxyDatabase.length} entries`);
    }
  } catch (error) {
    console.error('❌ Failed to load IP2Proxy database:', error.message);
  }

  // Load IP2Location
  try {
    if (fs.existsSync(locationDbPath)) {
      console.log('⏳ Loading IP2Location CSV...');
      ipLocationDatabase = await loadIPDatabase(locationDbPath, [
        'countryCode', 'countryName', 'regionName', 'cityName', 'isp', 'latitude', 'longitude', 'domain', 'zipCode', 'timeZone', 'netspeed', 'iddCode', 'areaCode', 'weatherStationCode', 'weatherStationName', 'mcc', 'mnc', 'mobileBrand', 'elevation', 'usageType'
      ]);
      console.log(`✅ IP2Location CSV loaded: ${ipLocationDatabase.length} entries`);
    }
  } catch (error) {
    console.error('❌ Failed to load IP2Location database:', error.message);
  }

  return true;
}

// --- Middlewares ---
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['GET'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));

// Rate limiting
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60000;
const RATE_LIMIT_MAX = 100;

app.use((req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 1, startTime: now });
  } else {
    const record = rateLimit.get(ip);
    if (now - record.startTime > RATE_LIMIT_WINDOW) {
      record.count = 1;
      record.startTime = now;
    } else {
      record.count++;
      if (record.count > RATE_LIMIT_MAX) {
        return res.status(429).json({ error: 'Too many requests. Please try again later.' });
      }
    }
  }
  next();
});

// --- IP Lookup Logic ---
function getIPInfo(ip) {
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
    return { error: 'Invalid or local IP address' };
  }

  const result = { ip };
  const isIPv6 = ip.includes(':');
  result.ipType = isIPv6 ? 'IPv6' : 'IPv4';
  if (isIPv6) result.ipv6 = ip; else result.ipv4 = ip;

  // Try MaxMind
  if (cityLookup || asnLookup) {
    try {
      const cityData = cityLookup?.get(ip);
      const asnData = asnLookup?.get(ip);
      if (cityData) {
        result.country = cityData.country?.names?.en;
        result.countryCode = cityData.country?.iso_code;
        result.region = cityData.subdivisions?.[0]?.names?.en;
        result.regionCode = cityData.subdivisions?.[0]?.iso_code;
        result.city = cityData.city?.names?.en;
        result.postalCode = cityData.postal?.code;
        result.latitude = cityData.location?.latitude;
        result.longitude = cityData.location?.longitude;
        result.timezone = cityData.location?.time_zone;
        result.source = 'MaxMind';
      }
      if (asnData) {
        result.isp = asnData.autonomous_system_organization;
        result.organization = asnData.autonomous_system_organization;
        result.asn = asnData.autonomous_system_number;
        result.asName = `AS${asnData.autonomous_system_number} ${asnData.autonomous_system_organization || ''}`;
        result.source = result.source ? result.source + ' + AS' : 'MaxMind ASN';
      }
    } catch (e) { }
  }

  // Try IP2Location/Proxy for IPv4
  if (!isIPv6) {
    const ipNum = ipToNumber(ip);
    if (ipNum !== null) {
      const proxyResult = lookupIP(ipNum, ipProxyDatabase);
      if (proxyResult) {
        result.source = result.source ? result.source + ' + IP2Proxy' : 'IP2Proxy';
        result.proxyType = proxyResult[2];
        result.country = result.country || proxyResult[4];
        result.countryCode = result.countryCode || proxyResult[3];
        result.region = result.region || proxyResult[5];
        result.city = result.city || proxyResult[6];
        result.isp = result.isp || proxyResult[7];
        result.domain = proxyResult[8];
        result.usageType = proxyResult[9];
        result.asn = result.asn || proxyResult[10];
        result.asName = result.asName || proxyResult[11];
        result.lastSeen = proxyResult[12];
        result.threat = proxyResult[13];
        result.provider = proxyResult[14];
      }

      const locResult = lookupIP(ipNum, ipLocationDatabase);
      if (locResult) {
        result.source = result.source ? (result.source.includes('IP2Location') ? result.source : result.source + ' + IP2Location') : 'IP2Location';
        result.country = result.country || locResult[3]; // countryName
        result.countryCode = result.countryCode || locResult[2]; // countryCode
        result.region = result.region || locResult[4];
        result.city = result.city || locResult[5];
        result.isp = result.isp || locResult[6];
        result.latitude = result.latitude || parseFloat(locResult[7]);
        result.longitude = result.longitude || parseFloat(locResult[8]);
        result.domain = result.domain || locResult[9];
        result.zipCode = result.zipCode || locResult[10];
        result.timeZone = result.timeZone || locResult[11];
        result.netspeed = locResult[12];
        result.iddCode = locResult[13];
        result.areaCode = locResult[14];
        result.weatherStationCode = locResult[15];
        result.weatherStationName = locResult[16];
        result.mcc = locResult[17];
        result.mnc = locResult[18];
        result.mobileBrand = locResult[19];
        result.elevation = locResult[20];
        result.usageType = result.usageType || locResult[21];
      }
    }
  }

  if (!result.country && !result.isp && !result.error) {
    return { error: 'IP address not found in databases', ip };
  }

  result.attribution = 'Contains data from MaxMind GeoLite2, IP2Location LITE, and IP2Proxy LITE.';
  return result;
}

function getClientIP(req) {
  const cfIP = req.headers['cf-connecting-ip'];
  const xRealIP = req.headers['x-real-ip'];
  const xForwardedFor = req.headers['x-forwarded-for'];
  let clientIP = cfIP || xRealIP || (xForwardedFor ? xForwardedFor.split(',')[0].trim() : '') || req.socket.remoteAddress || '';
  return clientIP.replace('::ffff:', '').replace('::1', '127.0.0.1');
}

// --- Endpoints ---

// Unified handlers for both path styles
const handleCurrentIP = (req, res) => {
  const ip = getClientIP(req);
  if (ip === '127.0.0.1' || ip === '::1') {
    return res.json({ error: 'Localhost access', ip });
  }
  res.json(getIPInfo(ip));
};

const handleSpecificIP = (req, res) => {
  res.json(getIPInfo(req.params.ip));
};

// Upstream paths
app.get('/ip', handleCurrentIP);
app.get('/ip/:ip', handleSpecificIP);
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.get('/info', (req, res) => res.json({
  version: '3.0.0-merged',
  databases: ['MaxMind', 'IP2Location', 'IP2Proxy'],
  supportedTypes: ['IPv4', 'IPv6']
}));

// Legacy/API paths
app.get('/api/ip', handleCurrentIP);
app.get('/api/ip/:ip', handleSpecificIP);
app.get('/api/health', (req, res) => res.json({ status: 'ok', merged: true }));
app.get('/api/attribution', (req, res) => res.json({
  attribution: 'Contains data from MaxMind GeoLite2, IP2Location LITE, and IP2Proxy LITE.',
  links: ['https://www.maxmind.com', 'https://lite.ip2location.com']
}));

// --- Start Server ---
async function start() {
  await initDatabases();
  app.listen(PORT, () => {
    console.log(`\n🚀 Merged API Server running on http://localhost:${PORT}`);
    console.log(`📡 Endpoints: /ip, /ip/:ip, /api/ip, /api/ip/:ip`);
  });
}

start();
