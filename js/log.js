// Ortak olay günlüğü: tüm sekmelerdeki işlemleri Supabase "olay_log" tablosuna yazar
(function () {
  const LOG_URL = 'https://ayxjajcymhqslanqkpqd.supabase.co/rest/v1/olay_log';
  const LOG_KEY = 'sb_publishable_ZAzI-b38n2eGkgY97LnFOQ_dhe4XUrr'; // herkese açık (publishable) anahtar
  const SAYFALAR = {
    '': 'genel-bakis', 'index.html': 'genel-bakis',
    'sunucular.html': 'sunucular', 'subnet.html': 'subnet', 'kayitlar.html': 'kayitlar'
  };
  const SAYFA = SAYFALAR[location.pathname.split('/').pop()] || 'genel-bakis';

  // Kullanım: logYaz('Olay adı', 'isteğe bağlı detay')
  window.logYaz = function (olay, detay) {
    return fetch(LOG_URL, {
      method: 'POST',
      keepalive: true, // sayfa yenilense bile istek tamamlansın
      headers: { apikey: LOG_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({
        sayfa: SAYFA,
        olay: String(olay).slice(0, 60),
        detay: detay == null ? null : String(detay).slice(0, 300)
      })
    }).catch(e => console.warn('Log yazılamadı:', e));
  };

  window.logYaz('Sayfa görüntülendi');
})();
