# 🌐 RezvanGate - سرویس بررسی آدرس IP

<div dir="rtl">

یک سرویس وب مدرن برای بررسی و دریافت اطلاعات کامل آدرس‌های IP با رابط کاربری فارسی و API انگلیسی.

[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev)

</div>

---

<div dir="rtl">

## ✨ امکانات

- 🔍 **جستجوی IP** - بررسی اطلاعات هر آدرس IP
- 🌍 **اطلاعات جغرافیایی** - کشور، شهر، منطقه، کد پستی
- 📍 **موقعیت مکانی** - طول و عرض جغرافیایی
- 🏢 **اطلاعات شبکه** - ISP، سازمان، AS Name
- 🕐 **منطقه زمانی** - تشخیص خودکار timezone
- 🚀 **API سریع** - پاسخ JSON به زبان انگلیسی
- 🎨 **طراحی مدرن** - تم تیره با رنگ سبز
- 📱 **واکنش‌گرا** - سازگار با موبایل و دسکتاپ
- 🔒 **امنیت بالا** - Rate Limiting و Security Headers
- 🌙 **PWA** - قابل نصب روی موبایل

## 📸 تصاویر

<p align="center">
  <img src="screenshots/home.png" alt="صفحه اصلی" width="80%">
</p>

## 🚀 شروع سریع

### پیش‌نیازها

- Node.js نسخه 18 یا بالاتر
- npm یا yarn

### دانلود پایگاه داده‌ها

<div dir="rtl">

قبل از اجرای پروژه، باید پایگاه داده‌های IP را دانلود کنید. برای این کار از اسکریپت `download.sh` استفاده کنید:

</div>

```bash
chmod +x download.sh
./download.sh
```

<div dir="rtl">

این اسکریپت به طور خودکار پایگاه داده‌های زیر را از https://lite.ip2location.com/ دانلود و استخراج می‌کند:

- `IP2LOCATION-LITE-DB11.CSV` - برای اطلاعات جغرافیایی
- `IP2PROXY-LITE-PX12.CSV` - برای تشخیص پروکسی و VPN

فایل‌ها در پوشه `data/` قرار می‌گیرند.

</div>

### نصب و راه‌اندازی (توسعه)

</div>

```bash
# کلون کردن پروژه
git clone https://github.com/Noirc0re/api-isp-org
cd api-isp-org

# نصب وابستگی‌ها
npm install

# اجرای سرور توسعه
npm run dev

# در ترمینال دیگر، اجرای API
npm run server
```

<div dir="rtl">

### نصب و راه‌اندازی (پروداکشن)

</div>

```bash
# ساخت نسخه پروداکشن
npm run build

# رفتن به پوشه dist
cd dist

# نصب وابستگی‌های سرور
npm install

# اجرا
npm start
```

<div dir="rtl">

## 📡 API

### Endpoints

</div>

| Method | Endpoint | توضیحات |
|--------|----------|---------|
| `GET` | `/api/ip` | دریافت اطلاعات IP فعلی کاربر |
| `GET` | `/api/ip/:ip` | دریافت اطلاعات یک IP خاص |
| `GET` | `/api/health` | بررسی وضعیت سرور |

<div dir="rtl">

### نمونه درخواست

</div>

```bash
curl https://your-domain.com/api/ip/8.8.8.8
```

<div dir="rtl">

### نمونه پاسخ

</div>

```json
{
  "ip": "8.8.8.8",
  "country": "United States",
  "countryCode": "US",
  "region": "Virginia",
  "regionCode": "VA",
  "city": "Ashburn",
  "postalCode": "20149",
  "latitude": 39.03,
  "longitude": -77.5,
  "timezone": "America/New_York",
  "isp": "Google LLC",
  "organization": "Google Public DNS",
  "asName": "AS15169 Google LLC"
}
```

<div dir="rtl">

## 🛠️ تکنولوژی‌ها

- **Frontend:** React 19, Vite
- **Backend:** Express 5, Node.js
- **Styling:** CSS3 با متغیرهای CSS
- **API:** ip-api.com

## 📁 ساختار پروژه

</div>

```
rezvangate/
├── src/
│   ├── App.jsx          # کامپوننت اصلی
│   ├── App.css          # استایل‌ها
│   ├── index.css        # استایل‌های پایه
│   └── main.jsx         # نقطه ورود
├── server/
│   └── index.js         # سرور API (توسعه)
├── dist/
│   ├── server.js        # سرور پروداکشن
│   ├── package.json     # وابستگی‌های پروداکشن
│   └── ...              # فایل‌های ساخته شده
├── public/
│   ├── manifest.json    # تنظیمات PWA
│   ├── sw.js            # Service Worker
│   └── icons/           # آیکون‌ها
├── index.html           # فایل HTML اصلی
├── package.json         # وابستگی‌ها
├── vite.config.js       # تنظیمات Vite
└── README.md            # مستندات
```

<div dir="rtl">

## 🔒 امنیت

- ✅ Rate Limiting (100 درخواست در دقیقه)
- ✅ Security Headers (CSP, X-Frame-Options, ...)
- ✅ Input Validation
- ✅ CORS Configuration
- ✅ Payload Size Limit

## 🤝 مشارکت

از مشارکت شما استقبال می‌کنیم! لطفاً:

1. پروژه را Fork کنید
2. یک Branch جدید بسازید (`git checkout -b feature/amazing-feature`)
3. تغییرات را Commit کنید (`git commit -m 'Add amazing feature'`)
4. به Branch خود Push کنید (`git push origin feature/amazing-feature`)
5. یک Pull Request باز کنید



<p align="center">
</p>

</div>
