# 📦 GeoIP Database Installation Guide

# راهنمای نصب دیتابیس GeoIP

<div dir="rtl">

این راهنما نحوه دانلود و نصب دیتابیس‌های MaxMind GeoLite2 را توضیح می‌دهد.

</div>

---

## 📋 Required Databases / دیتابیس‌های مورد نیاز

| Database | Size | Description |
|----------|------|-------------|
| `GeoLite2-Country.mmdb` | ~6 MB | Country-level geolocation |
| `GeoLite2-City.mmdb` | ~70 MB | City-level geolocation |
| `GeoLite2-ASN.mmdb` | ~8 MB | ISP/Organization info |

---

## 🔑 Step 1: Create MaxMind Account

<div dir="rtl">

### قدم ۱: ایجاد حساب MaxMind

</div>

1. Go to [MaxMind Sign Up](https://www.maxmind.com/en/geolite2/signup)
2. Fill in the registration form
3. Verify your email address
4. Log in to your account

<div dir="rtl">

1. به [ثبت‌نام MaxMind](https://www.maxmind.com/en/geolite2/signup) بروید
2. فرم ثبت‌نام را پر کنید
3. ایمیل خود را تأیید کنید
4. وارد حساب خود شوید

</div>

---

## 🔐 Step 2: Generate License Key

<div dir="rtl">

### قدم ۲: ایجاد کلید لایسنس

</div>

1. Go to **Account** → **Manage License Keys**
2. Click **Generate new license key**
3. Name it (e.g., "GeoIP Server")
4. Select **No** for GeoIP Update
5. Click **Confirm**
6. **Save your License Key** - you'll need it!

<div dir="rtl">

1. به **Account** → **Manage License Keys** بروید
2. روی **Generate new license key** کلیک کنید
3. یک نام بگذارید (مثلاً "GeoIP Server")
4. برای GeoIP Update گزینه **No** را انتخاب کنید
5. روی **Confirm** کلیک کنید
6. **کلید لایسنس را ذخیره کنید** - به آن نیاز دارید!

</div>

---

## 📥 Step 3: Download Databases

<div dir="rtl">

### قدم ۳: دانلود دیتابیس‌ها

</div>

### Option A: Direct Download (Manual)

Go to [MaxMind Download Page](https://www.maxmind.com/en/accounts/current/geoip/downloads) and download:

- GeoLite2-Country.mmdb
- GeoLite2-City.mmdb  
- GeoLite2-ASN.mmdb

### Option B: Using wget (Automated)

Replace `YOUR_ACCOUNT_ID` and `YOUR_LICENSE_KEY` with your credentials:

```bash
# Create data directory
mkdir -p data
cd data

# Set your credentials
ACCOUNT_ID="YOUR_ACCOUNT_ID"
LICENSE_KEY="YOUR_LICENSE_KEY"

# Download GeoLite2-Country
wget -O GeoLite2-Country.tar.gz "https://download.maxmind.com/geoip/databases/GeoLite2-Country/download?suffix=tar.gz" \
  --user="$ACCOUNT_ID" --password="$LICENSE_KEY"
tar -xzf GeoLite2-Country.tar.gz --strip-components=1 --wildcards "*/GeoLite2-Country.mmdb"
rm GeoLite2-Country.tar.gz

# Download GeoLite2-City
wget -O GeoLite2-City.tar.gz "https://download.maxmind.com/geoip/databases/GeoLite2-City/download?suffix=tar.gz" \
  --user="$ACCOUNT_ID" --password="$LICENSE_KEY"
tar -xzf GeoLite2-City.tar.gz --strip-components=1 --wildcards "*/GeoLite2-City.mmdb"
rm GeoLite2-City.tar.gz

# Download GeoLite2-ASN
wget -O GeoLite2-ASN.tar.gz "https://download.maxmind.com/geoip/databases/GeoLite2-ASN/download?suffix=tar.gz" \
  --user="$ACCOUNT_ID" --password="$LICENSE_KEY"
tar -xzf GeoLite2-ASN.tar.gz --strip-components=1 --wildcards "*/GeoLite2-ASN.mmdb"
rm GeoLite2-ASN.tar.gz

# Verify files
ls -la *.mmdb
```

### Option C: Using curl

```bash
# Create data directory
mkdir -p data
cd data

# Set your credentials
ACCOUNT_ID="YOUR_ACCOUNT_ID"
LICENSE_KEY="YOUR_LICENSE_KEY"

# Download all databases
for DB in GeoLite2-Country GeoLite2-City GeoLite2-ASN; do
  curl -u "$ACCOUNT_ID:$LICENSE_KEY" \
    "https://download.maxmind.com/geoip/databases/$DB/download?suffix=tar.gz" \
    -o "$DB.tar.gz"
  tar -xzf "$DB.tar.gz" --strip-components=1 --wildcards "*/$DB.mmdb"
  rm "$DB.tar.gz"
done

# Verify
ls -la *.mmdb
```

---

## 📁 Step 4: Verify Installation

<div dir="rtl">

### قدم ۴: تأیید نصب

</div>

After downloading, your `data/` folder should look like this:

```
data/
├── GeoLite2-ASN.mmdb      (~8 MB)
├── GeoLite2-City.mmdb     (~70 MB)
└── GeoLite2-Country.mmdb  (~6 MB)
```

Verify with:

```bash
ls -lh data/
```

Expected output:
```
-rw-r--r-- 1 root root 7.9M Dec 20 2025 GeoLite2-ASN.mmdb
-rw-r--r-- 1 root root  68M Dec 20 2025 GeoLite2-City.mmdb
-rw-r--r-- 1 root root 5.9M Dec 20 2025 GeoLite2-Country.mmdb
```

---

## 🔄 Updating Databases

<div dir="rtl">

### بروزرسانی دیتابیس‌ها

MaxMind دیتابیس‌ها را هفتگی بروزرسانی می‌کند. توصیه می‌شود ماهانه دیتابیس‌ها را بروز کنید.

</div>

MaxMind updates databases weekly. It's recommended to update monthly.

### Manual Update

Just re-run the download commands from Step 3.

### Automated Update (Cron)

Create a script `/root/update-geoip.sh`:

```bash
#!/bin/bash
ACCOUNT_ID="YOUR_ACCOUNT_ID"
LICENSE_KEY="YOUR_LICENSE_KEY"
DATA_DIR="/root/api-isp-org/data"

cd "$DATA_DIR"

for DB in GeoLite2-Country GeoLite2-City GeoLite2-ASN; do
  curl -s -u "$ACCOUNT_ID:$LICENSE_KEY" \
    "https://download.maxmind.com/geoip/databases/$DB/download?suffix=tar.gz" \
    -o "$DB.tar.gz"
  tar -xzf "$DB.tar.gz" --strip-components=1 --wildcards "*/$DB.mmdb"
  rm "$DB.tar.gz"
done

# Restart backend to reload databases
pm2 restart api-backend

echo "GeoIP databases updated at $(date)"
```

Add to crontab (runs monthly on 1st at 3:00 AM):

```bash
chmod +x /root/update-geoip.sh
crontab -e
# Add this line:
0 3 1 * * /root/update-geoip.sh >> /var/log/geoip-update.log 2>&1
```

---

## ❓ Troubleshooting

<div dir="rtl">

### رفع مشکلات

</div>

### Error: Database file not found

```bash
# Check if files exist
ls -la data/

# If not, download again
```

### Error: 401 Unauthorized

- Check your Account ID and License Key
- Make sure there are no extra spaces
- Regenerate license key if needed

### Error: Invalid database format

```bash
# Remove corrupted files
rm data/*.mmdb

# Re-download
```

### High memory usage (~140MB)

This is normal. The databases are loaded into memory for faster lookups. This is a trade-off for speed.

---

## 📜 License

<div dir="rtl">

### لایسنس

</div>

GeoLite2 databases are provided by MaxMind under the [GeoLite2 End User License Agreement](https://www.maxmind.com/en/geolite2/eula).

**Attribution Required:** When using GeoLite2 data, you must include the following attribution:

> This product includes GeoLite2 data created by MaxMind, available from [https://www.maxmind.com](https://www.maxmind.com).

---

## 🔗 Useful Links

- [MaxMind Account](https://www.maxmind.com/en/account)
- [GeoLite2 Downloads](https://www.maxmind.com/en/accounts/current/geoip/downloads)
- [GeoLite2 Documentation](https://dev.maxmind.com/geoip/geolite2-free-geolocation-data)
- [MaxMind Node.js API](https://github.com/maxmind/GeoIP2-node)

---

<p align="center">
  <a href="README.md">← Back to Main README</a>
</p>
