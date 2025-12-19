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

  const sampleResponse = {
    ip: "37.32.126.245",
    source: "IP2Location",
    country: "Iran",
    countryCode: "IR",
    region: "Tehran",
    city: "Tehran",
    isp: "Noyan Abr Arvan Co. ( Private Joint Stock)",
    latitude: 35.6944,
    longitude: 51.4215,
    domain: "arvancloud.com",
    zipCode: "",
    timeZone: "Asia/Tehran",
    netspeed: "T1",
    iddCode: "98",
    areaCode: "",
    weatherStationCode: "",
    weatherStationName: "",
    mcc: "",
    mnc: "",
    mobileBrand: "",
    elevation: "",
    usageType: "DCH",
    attribution: "This site or product includes IP2Location LITE data available from https://lite.ip2location.com"
  };

  const sampleProxyResponse = {
    ip: "192.168.1.1",
    source: "IP2Proxy",
    proxyType: "VPN",
    country: "United States",
    countryCode: "US",
    region: "California",
    city: "Los Angeles",
    isp: "Example ISP",
    domain: "example.com",
    usageType: "VPN",
    asn: "12345",
    as: "AS12345 Example AS",
    lastSeen: "30",
    threat: "LOW",
    provider: "Example VPN Provider",
    attribution: "This site or product includes IP2Proxy LITE data available from https://lite.ip2location.com"
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
                  <div className="ip-display" dir="ltr">{ipData.ip}</div>
                  <div className="ip-label">آدرس IP</div>
                  {ipData.source && (
                    <div className="source-badge">
                      منبع: {ipData.source === 'IP2Proxy' ? 'پروکسی' : 'موقعیت'}
                    </div>
                  )}
                </div>
                
                <div className="ip-info-grid">
                  <div className="info-item">
                    <span className="info-label">🌍 کشور</span>
                    <span className="info-value">
                      {ipData.countryCode && (
                        <img 
                          src={getCountryFlag(ipData.countryCode)} 
                          alt={ipData.country} 
                          className="flag-icon"
                        />
                      )}
                      {ipData.country || 'نامشخص'}
                    </span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">🏷️ کد کشور</span>
                    <span className="info-value highlight" dir="ltr">{ipData.countryCode || 'نامشخص'}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">📍 منطقه</span>
                    <span className="info-value">{ipData.region || 'نامشخص'}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">🏙️ شهر</span>
                    <span className="info-value">{ipData.city || 'نامشخص'}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">🌐 ISP</span>
                    <span className="info-value highlight" dir="ltr">{ipData.isp || 'نامشخص'}</span>
                  </div>
                  
                  {ipData.source === 'IP2Proxy' && (
                    <>
                      <div className="info-item">
                        <span className="info-label">🛡️ نوع پروکسی</span>
                        <span className="info-value highlight">{ipData.proxyType || 'نامشخص'}</span>
                      </div>
                      
                      <div className="info-item">
                        <span className="info-label">⚠️ تهدید</span>
                        <span className="info-value highlight">{ipData.threat || 'نامشخص'}</span>
                      </div>
                      
                      <div className="info-item">
                        <span className="info-label">🏢 ارائه‌دهنده</span>
                        <span className="info-value">{ipData.provider || 'نامشخص'}</span>
                      </div>
                      
                      <div className="info-item">
                        <span className="info-label">🔗 ASN</span>
                        <span className="info-value highlight" dir="ltr">{ipData.asn || 'نامشخص'}</span>
                      </div>
                      
                      <div className="info-item">
                        <span className="info-label">📊 AS</span>
                        <span className="info-value" dir="ltr">{ipData.as || 'نامشخص'}</span>
                      </div>
                      
                      <div className="info-item">
                        <span className="info-label">🕐 آخرین مشاهده</span>
                        <span className="info-value" dir="ltr">{ipData.lastSeen || 'نامشخص'}</span>
                      </div>
                    </>
                  )}
                  
                  {ipData.source === 'IP2Location' && (
                    <>
                      <div className="info-item">
                        <span className="info-label">📐 عرض جغرافیایی</span>
                        <span className="info-value highlight" dir="ltr">{ipData.latitude || 'نامشخص'}</span>
                      </div>
                      
                      <div className="info-item">
                        <span className="info-label">📐 طول جغرافیایی</span>
                        <span className="info-value highlight" dir="ltr">{ipData.longitude || 'نامشخص'}</span>
                      </div>
                      
                      <div className="info-item">
                        <span className="info-label">🕐 منطقه زمانی</span>
                        <span className="info-value" dir="ltr">{ipData.timeZone || 'نامشخص'}</span>
                      </div>
                      
                      <div className="info-item">
                        <span className="info-label">📮 کد پستی</span>
                        <span className="info-value" dir="ltr">{ipData.zipCode || 'نامشخص'}</span>
                      </div>
                      
                      <div className="info-item">
                        <span className="info-label">🌐 سرعت شبکه</span>
                        <span className="info-value">{ipData.netspeed || 'نامشخص'}</span>
                      </div>
                      
                      <div className="info-item">
                        <span className="info-label">📞 کد IDD</span>
                        <span className="info-value highlight" dir="ltr">{ipData.iddCode || 'نامشخص'}</span>
                      </div>
                      
                      <div className="info-item">
                        <span className="info-label">🏢 نوع استفاده</span>
                        <span className="info-value">{ipData.usageType || 'نامشخص'}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'api' && (
          <section className="api-section">
            <h2 className="section-title">
              <span>⚡</span> مستندات API
            </h2>
            
            <div className="api-endpoints">
              {/* Endpoint 1 */}
              <div className="api-endpoint">
                <div className="endpoint-header">
                  <span className="method">GET</span>
                  <span className="endpoint-url" dir="ltr">/api/ip</span>
                </div>
                <div className="endpoint-body">
                  <p className="endpoint-desc">
                    اطلاعات آدرس IP فعلی شما را برمی‌گرداند.
                  </p>
                  <div className="code-block">
                    <pre dir="ltr">{`curl ${getSiteUrl()}/api/ip`}</pre>
                  </div>
                </div>
              </div>

              {/* Endpoint 2 */}
              <div className="api-endpoint">
                <div className="endpoint-header">
                  <span className="method">GET</span>
                  <span className="endpoint-url" dir="ltr">/api/ip/:ip</span>
                </div>
                <div className="endpoint-body">
                  <p className="endpoint-desc">
                    اطلاعات یک آدرس IP خاص را برمی‌گرداند.
                  </p>
                  <div className="code-block">
                    <pre dir="ltr">{`curl ${getSiteUrl()}/api/ip/37.32.126.245`}</pre>
                  </div>
                </div>
              </div>

              {/* Sample Response */}
              <div className="api-endpoint">
                <div className="endpoint-header">
                  <span className="method">JSON</span>
                  <span className="endpoint-url">نمونه پاسخ</span>
                </div>
                <div className="endpoint-body">
                  <p className="endpoint-desc">
                    نمونه پاسخ JSON از API برای IP معمولی (خروجی به انگلیسی است):
                  </p>
                  <div className="code-block">
                    <pre dir="ltr">{JSON.stringify(sampleResponse, null, 2)}</pre>
                  </div>
                  <p className="endpoint-desc" style={{ marginTop: '1rem' }}>
                    نمونه پاسخ JSON از API برای IP پروکسی:
                  </p>
                  <div className="code-block">
                    <pre dir="ltr">{JSON.stringify(sampleProxyResponse, null, 2)}</pre>
                  </div>
                </div>
              </div>

              {/* Response Fields */}
              <div className="api-endpoint">
                <div className="endpoint-header">
                  <span className="method">INFO</span>
                  <span className="endpoint-url">فیلدهای پاسخ</span>
                </div>
                <div className="endpoint-body">
                  <div className="ip-info-grid" style={{ background: 'transparent', gap: '0' }}>
                    <div className="info-item">
                      <span className="info-label" dir="ltr">source</span>
                      <span className="info-value">منبع داده (IP2Proxy یا IP2Location)</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label" dir="ltr">ip</span>
                      <span className="info-value">آدرس IP</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label" dir="ltr">country</span>
                      <span className="info-value">نام کشور</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label" dir="ltr">countryCode</span>
                      <span className="info-value">کد ISO کشور</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label" dir="ltr">region</span>
                      <span className="info-value">نام منطقه/استان</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label" dir="ltr">city</span>
                      <span className="info-value">نام شهر</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label" dir="ltr">isp</span>
                      <span className="info-value">ارائه‌دهنده اینترنت</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label" dir="ltr">domain</span>
                      <span className="info-value">دامنه</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label" dir="ltr">usageType</span>
                      <span className="info-value">نوع استفاده</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label" dir="ltr">latitude</span>
                      <span className="info-value">عرض جغرافیایی (IP2Location)</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label" dir="ltr">longitude</span>
                      <span className="info-value">طول جغرافیایی (IP2Location)</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label" dir="ltr">timeZone</span>
                      <span className="info-value">منطقه زمانی (IP2Location)</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label" dir="ltr">zipCode</span>
                      <span className="info-value">کد پستی (IP2Location)</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label" dir="ltr">netspeed</span>
                      <span className="info-value">سرعت شبکه (IP2Location)</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label" dir="ltr">iddCode</span>
                      <span className="info-value">کد IDD (IP2Location)</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label" dir="ltr">areaCode</span>
                      <span className="info-value">کد منطقه (IP2Location)</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label" dir="ltr">weatherStationCode</span>
                      <span className="info-value">کد ایستگاه هواشناسی (IP2Location)</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label" dir="ltr">weatherStationName</span>
                      <span className="info-value">نام ایستگاه هواشناسی (IP2Location)</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label" dir="ltr">mcc</span>
                      <span className="info-value">کد کشور موبایل (IP2Location)</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label" dir="ltr">mnc</span>
                      <span className="info-value">کد شبکه موبایل (IP2Location)</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label" dir="ltr">mobileBrand</span>
                      <span className="info-value">برند موبایل (IP2Location)</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label" dir="ltr">elevation</span>
                      <span className="info-value">ارتفاع (IP2Location)</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label" dir="ltr">proxyType</span>
                      <span className="info-value">نوع پروکسی (IP2Proxy)</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label" dir="ltr">asn</span>
                      <span className="info-value">شماره سیستم خودمختار (IP2Proxy)</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label" dir="ltr">as</span>
                      <span className="info-value">نام AS (IP2Proxy)</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label" dir="ltr">lastSeen</span>
                      <span className="info-value">آخرین مشاهده (IP2Proxy)</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label" dir="ltr">threat</span>
                      <span className="info-value">سطح تهدید (IP2Proxy)</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label" dir="ltr">provider</span>
                      <span className="info-value">ارائه‌دهنده (IP2Proxy)</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label" dir="ltr">attribution</span>
                      <span className="info-value">اطلاعات انتساب</span>
                    </div>
                  </div>
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
