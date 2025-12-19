import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Load IP2Proxy database
let ipProxyDatabase = [];
const proxyDbPath = path.join(__dirname, '../data/IP2PROXY-LITE-PX12.CSV/IP2PROXY-LITE-PX12.CSV');

// Load IP2Location database
let ipLocationDatabase = [];
const locationDbPath = path.join(__dirname, '../data/IP2LOCATION-LITE-DB11.CSV/IP2LOCATION-LITE-DB11.CSV');

// Helper to load and sort a CSV database using streaming
async function loadIPDatabase(dbPath, columns) {
  return new Promise((resolve, reject) => {
    const db = [];
    const fileStream = fs.createReadStream(dbPath, { encoding: 'utf8' });
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    rl.on('line', (line) => {
      const parts = line.split(',').map(p => p.replace(/"/g, ''));
      const entry = new Array(columns.length + 2);
      entry[0] = BigInt(parts[0]); // ipFrom
      entry[1] = BigInt(parts[1]); // ipTo
      for (let i = 0; i < columns.length; i++) {
        entry[i + 2] = parts[i] === '-' ? null : parts[i];
      }
      db.push(entry);
    });

    rl.on('close', () => {
      console.log(`Sorting ${db.length} entries...`);
      db.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
      resolve(db);
    });

    rl.on('error', reject);
    fileStream.on('error', reject);
  });
}

console.log('Loading IP2Proxy database...');
try {
  ipProxyDatabase = await loadIPDatabase(proxyDbPath, [
    'ipFrom','ipTo','proxyType','countryCode','countryName','regionName','cityName','isp','domain','usageType','asn','as','lastSeen','threat','provider'
  ]);
  console.log(`IP2Proxy database loaded: ${ipProxyDatabase.length} entries`);
  console.log(`First entry: ${ipProxyDatabase[0][0]} - ${ipProxyDatabase[0][1]}`);
  console.log(`Last entry: ${ipProxyDatabase[ipProxyDatabase.length - 1][0]} - ${ipProxyDatabase[ipProxyDatabase.length - 1][1]}`);
} catch (error) {
  console.error('Failed to load IP2Proxy database:', error.message);
  process.exit(1);
}

console.log('Loading IP2Location database...');
try {
  ipLocationDatabase = await loadIPDatabase(locationDbPath, [
    'ipFrom','ipTo','countryCode','countryName','regionName','cityName','isp','latitude','longitude','domain','zipCode','timeZone','netspeed','iddCode','areaCode','weatherStationCode','weatherStationName','mcc','mnc','mobileBrand','elevation','usageType'
  ]);
  console.log(`IP2Location database loaded: ${ipLocationDatabase.length} entries`);
  console.log(`First entry: ${ipLocationDatabase[0][0]} - ${ipLocationDatabase[0][1]}`);
  console.log(`Last entry: ${ipLocationDatabase[ipLocationDatabase.length - 1][0]} - ${ipLocationDatabase[ipLocationDatabase.length - 1][1]}`);
} catch (error) {
  console.error('Failed to load IP2Location database:', error.message);
  process.exit(1);
}

// Convert IP address to numeric format
function ipToNumber(ip) {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  
  // Validate each octet is between 0-255
  for (const part of parts) {
    const num = parseInt(part, 10);
    if (isNaN(num) || num < 0 || num > 255) return null;
  }
  
  return BigInt(
    (parseInt(parts[0], 10) * 256 * 256 * 256) +
    (parseInt(parts[1], 10) * 256 * 256) +
    (parseInt(parts[2], 10) * 256) +
    parseInt(parts[3], 10)
  );
}

// Binary search for IP in database
function lookupIP(ipNum, db) {
  let left = 0;
  let right = db.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const entry = db[mid];
    
    if (ipNum >= entry[0] && ipNum <= entry[1]) {
      return entry;
    }
    
    if (ipNum < entry[0]) {
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }
  
  return null;
}

// Get IP information from both databases
function getIPInfo(ip) {
  if (!ip || ip === '127.0.0.1' || ip === 'localhost') {
    return {
      error: 'Cannot lookup localhost or empty IP',
      attribution: 'This site or product includes IP2Proxy LITE and IP2Location LITE data available from https://lite.ip2location.com'
    };
  }
  const ipNum = ipToNumber(ip);
  if (!ipNum && ipNum !== 0n) {
    return {
      error: 'Invalid IP address format',
      attribution: 'This site or product includes IP2Proxy LITE and IP2Location LITE data available from https://lite.ip2location.com'
    };
  }

  // Try IP2Proxy first
  const proxyResult = lookupIP(ipNum, ipProxyDatabase);
  if (proxyResult) {
    return {
      ip: ip,
      source: 'IP2Proxy',
      proxyType: proxyResult[2],
      country: proxyResult[4],
      countryCode: proxyResult[3],
      region: proxyResult[5],
      city: proxyResult[6],
      isp: proxyResult[7],
      domain: proxyResult[8],
      usageType: proxyResult[9],
      asn: proxyResult[10],
      as: proxyResult[11],
      lastSeen: proxyResult[12],
      threat: proxyResult[13],
      provider: proxyResult[14],
      attribution: 'This site or product includes IP2Proxy LITE data available from https://lite.ip2location.com'
    };
  }

  // Fallback to IP2Location
  const locationResult = lookupIP(ipNum, ipLocationDatabase);
  if (locationResult) {
    return {
      ip: ip,
      source: 'IP2Location',
      country: locationResult[4],
      countryCode: locationResult[3],
      region: locationResult[5],
      city: locationResult[6],
      isp: locationResult[7],
      latitude: locationResult[8],
      longitude: locationResult[9],
      domain: locationResult[10],
      zipCode: locationResult[11],
      timeZone: locationResult[12],
      netspeed: locationResult[13],
      iddCode: locationResult[14],
      areaCode: locationResult[15],
      weatherStationCode: locationResult[16],
      weatherStationName: locationResult[17],
      mcc: locationResult[18],
      mnc: locationResult[19],
      mobileBrand: locationResult[20],
      elevation: locationResult[21],
      usageType: locationResult[22],
      attribution: 'This site or product includes IP2Location LITE data available from https://lite.ip2location.com'
    };
  }

  // Not found in either database
  const proxyMin = ipProxyDatabase.length ? ipProxyDatabase[0][0] : null;
  const proxyMax = ipProxyDatabase.length ? ipProxyDatabase[ipProxyDatabase.length - 1][1] : null;
  const locMin = ipLocationDatabase.length ? ipLocationDatabase[0][0] : null;
  const locMax = ipLocationDatabase.length ? ipLocationDatabase[ipLocationDatabase.length - 1][1] : null;
  return {
    error: 'IP address not found in either database',
    ip: ip,
    ipNumeric: ipNum.toString(),
    proxyDbRange: proxyMin && proxyMax ? `${proxyMin} - ${proxyMax}` : 'unknown',
    locationDbRange: locMin && locMax ? `${locMin} - ${locMax}` : 'unknown',
    attribution: 'This site or product includes IP2Proxy LITE and IP2Location LITE data available from https://lite.ip2location.com'
  };
}

// Security middleware
app.use((req, res, next) => {
  // Security headers
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

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['GET'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' })); // Limit payload size

// Rate limiting (simple in-memory)
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 100; // 100 requests per minute

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

// Clean up rate limit map periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimit.entries()) {
    if (now - record.startTime > RATE_LIMIT_WINDOW * 2) {
      rateLimit.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW);

// API endpoint for IP lookup
app.get('/api/ip', async (req, res) => {
  // Get client IP
  const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const ip = clientIP.replace('::ffff:', '').replace('::1', '127.0.0.1');
  
  const info = getIPInfo(ip === '127.0.0.1' ? '' : ip);
  res.json(info);
});

app.get('/api/ip/:ip', async (req, res) => {
  const { ip } = req.params;
  
  // Validate IP format
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  
  if (!ipv4Regex.test(ip)) {
    return res.status(400).json({ 
      error: 'Invalid IP address format. Only IPv4 addresses are supported.',
      attribution: 'This site or product includes IP2Proxy LITE and IP2Location LITE data available from https://lite.ip2location.com'
    });
  }
  
  const info = getIPInfo(ip);
  res.json(info);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    proxyDatabaseEntries: ipProxyDatabase.length,
    locationDatabaseEntries: ipLocationDatabase.length
  });
});

// Attribution endpoint
app.get('/api/attribution', (req, res) => {
  res.json({
    databases: ['IP2Proxy LITE PX12', 'IP2Location LITE DB11'],
    attribution: 'This site or product includes IP2Proxy LITE and IP2Location LITE data available from https://lite.ip2location.com',
    license: 'https://www.ip2location.com/free/license',
    proxyEntries: ipProxyDatabase.length,
    locationEntries: ipLocationDatabase.length
  });
});

app.listen(PORT, () => {
  console.log(`API Server running on http://localhost:${PORT}`);
  console.log(`\nAPI Endpoints:`);
  console.log(`  GET /api/ip            - Get your IP information`);
  console.log(`  GET /api/ip/:ip        - Get information for a specific IP`);
  console.log(`  GET /api/health        - Health check`);
  console.log(`  GET /api/attribution   - Database attribution information`);
});
