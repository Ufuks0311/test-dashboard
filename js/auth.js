// Ortak oturum yönetimi: tüm sayfalarda giriş zorunluluğu + 5 dk hareketsizlikte otomatik çıkış
// Her sayfanın <head> bölümünde, supabase-js'ten hemen sonra yüklenir.
(function () {
  const SB_URL = 'https://ayxjajcymhqslanqkpqd.supabase.co';
  const SB_KEY = 'sb_publishable_ZAzI-b38n2eGkgY97LnFOQ_dhe4XUrr'; // herkese açık (publishable) anahtar
  let BOSTA_SURE = (parseInt(localStorage.getItem('panoBostaSureDk') || '5', 10) || 5) * 60 * 1000; // Ayarlar sekmesinden okunur
  const UYARI_SURE = 60 * 1000;       // son 1 dakikada geri sayım uyarısı
  const ETKINLIK_ANAHTAR = 'panoSonEtkinlik'; // sekmeler arası paylaşılan son etkinlik zamanı

  // Oturum doğrulanana kadar sayfa içeriğini gizle
  const stil = document.createElement('style');
  stil.textContent =
    'html.kilitli body{visibility:hidden}' +
    'header{flex-wrap:wrap}' +
    '.oturum-alan{display:flex;align-items:center;gap:.6rem;font-size:.8rem;color:#8b949e;white-space:nowrap}' +
    '.oturum-alan button{background:transparent;color:var(--metin);border:1px solid rgba(255,255,255,.2);border-radius:6px;padding:.3rem .65rem;font-size:.78rem;cursor:pointer}' +
    '.oturum-alan button:hover{border-color:var(--vurgu);color:var(--vurgu)}' +
    '.oturum-uyari{position:fixed;left:50%;bottom:1.25rem;transform:translateX(-50%);background:#2d2410;border:1px solid #e3b341;color:#f5d98a;padding:.75rem 1rem;border-radius:10px;display:flex;gap:1rem;align-items:center;z-index:9999;font-size:.9rem;box-shadow:0 8px 30px rgba(0,0,0,.4)}' +
    '.oturum-uyari button{background:#e3b341;color:#1a1300;border:none;border-radius:6px;padding:.4rem .8rem;font-weight:600;cursor:pointer}';
  document.head.appendChild(stil);
  document.documentElement.classList.add('kilitli');

  const sb = window.supabase.createClient(SB_URL, SB_KEY);
  window.sb = sb; // sayfalar aynı istemciyi kullanır
  const sayfa = location.pathname.split('/').pop() || 'index.html';
  const girisAdresi = neden => 'giris.html?next=' + encodeURIComponent(sayfa) + (neden ? '&neden=' + neden : '');

  // Veritabanına doğrudan istek atan sayfalar için: giriş yapan kullanıcının kimliğiyle başlıklar
  window.yetkiBasliklari = function (ek) {
    const b = { apikey: SB_KEY };
    if (window.oturumToken) b.Authorization = 'Bearer ' + window.oturumToken;
    return Object.assign(b, ek || {});
  };

  const sonEtkinlik = () => parseInt(localStorage.getItem(ETKINLIK_ANAHTAR) || '0', 10);
  const etkinlikKaydet = () => { try { localStorage.setItem(ETKINLIK_ANAHTAR, String(Date.now())); } catch (e) {} };
  const domHazirsa = fn => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : setTimeout(fn, 0));

  let hazir = false, cikiliyor = false, hazirCoz, uyari = null, sonYazim = 0;
  window.oturumHazir = new Promise(r => { hazirCoz = r; });

  async function cikisYap(neden) {
    if (cikiliyor) return;
    cikiliyor = true;
    if (window.logYaz) {
      try {
        await window.logYaz(neden === 'zamanasimi' ? 'Oturum zaman aşımı' : 'Çıkış yapıldı',
          neden === 'zamanasimi' ? Math.round(BOSTA_SURE / 60000) + ' dakika işlem yapılmadı' : null);
      } catch (e) {}
    }
    try { await sb.auth.signOut(); } catch (e) {}
    location.replace(girisAdresi(neden));
  }
  window.cikisYap = cikisYap;

  // Otomatik çıkış süresini güncelle (Ayarlar sekmesi ve oturum açılışı kullanır)
  window.oturumSuresiAyarla = function (dk) {
    dk = parseInt(dk, 10);
    if (!(dk >= 2 && dk <= 120)) return;
    BOSTA_SURE = dk * 60 * 1000;
    try { localStorage.setItem('panoBostaSureDk', String(dk)); } catch (e) {}
  };

  sb.auth.onAuthStateChange((olay, oturum) => {
    if (cikiliyor) return;
    if (!oturum) { location.replace(girisAdresi(olay === 'SIGNED_OUT' ? 'cikis' : '')); return; }
    window.oturumToken = oturum.access_token; // yenilenen token'ı her zaman güncel tut
    window.aktifKullanici = oturum.user;
    if (hazir) return;
    // Uzun süre sonra geri dönülmüşse (ör. tarayıcı açık kalmış, ertesi gün) oturumu kapat
    const son = sonEtkinlik();
    if (son && Date.now() - son > BOSTA_SURE) { domHazirsa(() => cikisYap('zamanasimi')); return; }
    etkinlikKaydet();
    hazir = true;
    document.documentElement.classList.remove('kilitli');
    hazirCoz(oturum);
    domHazirsa(arayuzKur);
    // Güncel otomatik çıkış süresini veritabanından al (dinleyici içinde beklememek için ertele)
    setTimeout(() => {
      sb.from('sistem_ayar').select('oturum_suresi_dk').eq('id', 1).maybeSingle()
        .then(({ data }) => { if (data) window.oturumSuresiAyarla(data.oturum_suresi_dk); });
    }, 0);
  });

  function arayuzKur() {
    const header = document.querySelector('header');
    if (header && !header.querySelector('.oturum-alan')) {
      const alan = document.createElement('span');
      alan.className = 'oturum-alan';
      const kisi = document.createElement('span');
      kisi.textContent = window.aktifKullanici ? window.aktifKullanici.email : '';
      const btn = document.createElement('button');
      btn.type = 'button'; btn.textContent = 'Çıkış'; btn.dataset.log = 'ozel';
      btn.addEventListener('click', () => cikisYap('cikis'));
      alan.append(kisi, btn);
      header.appendChild(alan);
    }
    ['mousemove', 'mousedown', 'keydown', 'scroll', 'wheel', 'touchstart'].forEach(t =>
      window.addEventListener(t, etkinlikYakala, { passive: true, capture: true }));
    setInterval(kontrol, 1000);
  }

  function etkinlikYakala() {
    const simdi = Date.now();
    if (simdi - sonYazim > 3000) { sonYazim = simdi; etkinlikKaydet(); uyariGizle(); }
  }

  function kontrol() {
    const kalan = BOSTA_SURE - (Date.now() - sonEtkinlik());
    if (kalan <= 0) { cikisYap('zamanasimi'); return; }
    if (kalan <= UYARI_SURE) uyariGoster(Math.ceil(kalan / 1000)); else uyariGizle();
  }

  function uyariGoster(saniye) {
    if (!uyari) {
      uyari = document.createElement('div');
      uyari.className = 'oturum-uyari';
      uyari.setAttribute('role', 'alert');
      uyari.innerHTML = '<span></span><button type="button" data-log="ozel">Oturumda kal</button>';
      uyari.querySelector('button').addEventListener('click', () => { etkinlikKaydet(); uyariGizle(); });
      document.body.appendChild(uyari);
    }
    uyari.querySelector('span').textContent = 'İşlem yapılmadığı için oturumunuz ' + saniye + ' saniye içinde kapanacak.';
  }
  function uyariGizle() { if (uyari) { uyari.remove(); uyari = null; } }
})();
