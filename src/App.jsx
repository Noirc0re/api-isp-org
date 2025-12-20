import { useState, useEffect } from 'react';
import './App.css';

const API_BASE = '';

// Get current site URL for API documentation
const getSiteUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'https://your-domain.com';
};

function App() {
  const [ipData, setIpData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchIp, setSearchIp] = useState('');
  const [activeTab, setActiveTab] = useState('home');

  const fetchIpInfo = async (ip = '') => {
    setLoading(true);
    setError(null);
    try {
      const url = ip ? `${API_BASE}/api/ip/${ip}` : `${API_BASE}/api/ip`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setIpData(null);
      } else {
        setIpData(data);
      }
    } catch (err) {
      setError('خطا در اتصال به سرور API. مطمئن شوید سرور روی پورت 3001 در حال اجراست.');
      setIpData(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchIpInfo();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchIp.trim()) {
      fetchIpInfo(searchIp.trim());
    }
  };

  const getCountryFlag = (countryCode) => {
    if (!countryCode) return '';
    return `https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`;
  };

  const renderInfoItem = (label, value, isHighlight = false) => {
    if (value === undefined || value === null || value === '' || value === 'Unknown' || value === 0) return null;
    return (
      <div className="info-item">
        <span className="info-label">{label}</span>
        <span className={`info-value ${isHighlight ? 'highlight' : ''}`} dir={typeof value === 'string' && /[a-zA-Z]/.test(value) ? 'ltr' : 'rtl'}>
          {value}
        </span>
      </div>
    );
  };

  return (
    <div className="app" dir="rtl">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <a href="/" className="logo">
            <span className="logo-icon">◉</span>
            RezvanGate
          </a>
          <nav className="nav">
            <a
              href="#home"
              className={`nav-link ${activeTab === 'home' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('home'); }}
            >
              خانه
            </a>
            <a
              href="#api"
              className={`nav-link ${activeTab === 'api' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('api'); }}
            >
              مستندات API
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="main">
        {/* Hero */}
        <section className="hero">
          <h1 className="hero-title">بررسی آدرس IP</h1>
          <p className="hero-subtitle">
            اطلاعات کامل درباره هر آدرس IP شامل موقعیت مکانی، ISP، سازمان و موارد بیشتر را دریافت کنید.
          </p>
        </section>

        {/* Search */}
        <div className="search-container">
          <form onSubmit={handleSearch} className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="آدرس IP را وارد کنید (مثال: 8.8.8.8)"
              value={searchIp}
              onChange={(e) => setSearchIp(e.target.value)}
              dir="ltr"
            />
            <button type="submit" className="search-btn" disabled={loading}>
              {loading ? '⟳' : '🔍'} جستجو
            </button>
          </form>
        </div>

        {activeTab === 'home' && (
          <>
            {/* Loading */}
            {loading && (
              <div className="loading">
                <div className="spinner"></div>
                <p>در حال دریافت اطلاعات IP...</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="error">
                <p>⚠️ {error}</p>
              </div>
            )}

            {/* IP Info Card */}
            {ipData && !loading && (
              <div className="ip-info-card">
                <div className="ip-header">
                  <div className="ip-display" dir="ltr">
                    {ipData.ipv4 || ipData.ip}
                  </div>
                  <div className="ip-label">
                    آدرس IP {ipData.ipv4 ? '(IPv4)' : ipData.ipType === 'IPv4' ? '(IPv4)' : '(IPv6)'}
                  </div>
                  {ipData.ipv6 && (
                    <div className="ip-secondary" dir="ltr">
                      <span className="ip-secondary-label">IPv6: </span>
                      <span className="ip-secondary-value">{ipData.ipv6}</span>
                    </div>
                  )}
                  {ipData.source && (
                    <div className="source-badge">
                      <span className="source-label">منبع: </span>
                      <span className="source-value">{ipData.source}</span>
                    </div>
                  )}
                </div>

                <div className="ip-info-grid">
                  {renderInfoItem("🌍 کشور", ipData.countryCode ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img
                        src={getCountryFlag(ipData.countryCode)}
                        alt={ipData.country}
                        className="flag-icon"
                      />
                      {ipData.country}
                    </span>
                  ) : ipData.country)}

                  {renderInfoItem("🏷️ کد کشور", ipData.countryCode, true)}
                  {renderInfoItem("📍 منطقه", ipData.region)}
                  {renderInfoItem("🏙️ شهر", ipData.city)}
                  {renderInfoItem("🌐 ISP", ipData.isp, true)}
                  {renderInfoItem("🏢 سازمان", ipData.organization)}
                  {renderInfoItem("📊 AS", ipData.asName || ipData.as)}
                  {renderInfoItem("🔗 ASN", ipData.asn, true)}

                  {/* IP2Proxy specific */}
                  {renderInfoItem("🛡️ نوع پروکسی", ipData.proxyType, true)}
                  {renderInfoItem("⚠️ تهدید", ipData.threat, true)}
                  {renderInfoItem("🏢 ارائه‌دهنده", ipData.provider)}
                  {renderInfoItem("🕐 آخرین مشاهده", ipData.lastSeen)}

                  {/* IP2Location specific */}
                  {renderInfoItem("📐 عرض جغرافیایی", ipData.latitude, true)}
                  {renderInfoItem("📐 طول جغرافیایی", ipData.longitude, true)}
                  {renderInfoItem("🕐 منطقه زمانی", ipData.timezone || ipData.timeZone)}
                  {renderInfoItem("📮 کد پستی", ipData.postalCode || ipData.zipCode)}
                  {renderInfoItem("🌐 سرعت شبکه", ipData.netspeed)}
                  {renderInfoItem("📞 کد IDD", ipData.iddCode, true)}
                  {renderInfoItem("🏢 نوع استفاده", ipData.usageType)}
                  {renderInfoItem("🏔️ ارتفاع", ipData.elevation)}
                  {renderInfoItem("🌦️ ایستگاه", ipData.weatherStationName)}
                </div>

                {ipData.attribution && (
                  <div className="attribution" style={{ marginTop: '20px', fontSize: '0.8rem', opacity: 0.7, textAlign: 'center' }}>
                    {ipData.attribution}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {activeTab === 'api' && (
          <section className="api-section">
            <h2 className="section-title">
              <span>⚡</span> مستندات API
            </h2>

            <p className="api-intro" style={{ marginBottom: '2rem', opacity: 0.8 }}>
              سرویس RezvanGate از هر دو سبک آدرس‌دهی (جدید و قدیمی) پشتیبانی می‌کند. پاسخ‌ها شامل اطلاعات ادغام شده از چندین پایگاه داده هستند.
            </p>

            <div className="api-endpoints">
              <div className="api-endpoint">
                <div className="endpoint-header">
                  <span className="method">GET</span>
                  <div className="endpoint-urls" style={{ display: 'flex', gap: '1rem' }}>
                    <span className="endpoint-url" dir="ltr">/ip</span>
                    <span className="endpoint-url" dir="ltr">/api/ip</span>
                  </div>
                </div>
                <div className="endpoint-body">
                  <p className="endpoint-desc">
                    اطلاعات آدرس IP فعلی شما را برمی‌گرداند.
                  </p>
                  <div className="code-block">
                    <pre dir="ltr">{`curl ${getSiteUrl()}/ip`}</pre>
                  </div>
                </div>
              </div>

              <div className="api-endpoint">
                <div className="endpoint-header">
                  <span className="method">GET</span>
                  <div className="endpoint-urls" style={{ display: 'flex', gap: '1rem' }}>
                    <span className="endpoint-url" dir="ltr">/ip/:ip</span>
                    <span className="endpoint-url" dir="ltr">/api/ip/:ip</span>
                  </div>
                </div>
                <div className="endpoint-body">
                  <p className="endpoint-desc">
                    اطلاعات یک آدرس IP خاص را برمی‌گرداند.
                  </p>
                  <div className="code-block">
                    <pre dir="ltr">{`curl ${getSiteUrl()}/ip/8.8.8.8`}</pre>
                  </div>
                </div>
              </div>

              <div className="api-endpoint">
                <div className="endpoint-header">
                  <span className="method">GET</span>
                  <div className="endpoint-urls" style={{ display: 'flex', gap: '1rem' }}>
                    <span className="endpoint-url" dir="ltr">/info</span>
                    <span className="endpoint-url" dir="ltr">/health</span>
                  </div>
                </div>
                <div className="endpoint-body">
                  <p className="endpoint-desc">
                    اطلاعات سیستم و وضعیت سلامت API را برمی‌گرداند.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>
          ساخته شده با <span className="footer-heart">♥</span> | RezvanGate - سرویس API بررسی IP
        </p>
      </footer>
    </div>
  );
}

export default App;
