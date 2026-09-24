// Ortak olay günlüğü: tüm sekmelerdeki işlemleri Supabase "olay_log" tablosuna yazar
(function () {
  const LOG_URL = 'https://ayxjajcymhqslanqkpqd.supabase.co/rest/v1/olay_log';
  const LOG_KEY = 'sb_publishable_ZAzI-b38n2eGkgY97LnFOQ_dhe4XUrr'; // herkese açık (publishable) anahtar
  const SAYFALAR = {
    '': 'genel-bakis', 'index.html': 'genel-bakis',
    'sunucular.html': 'sunucular', 'subnet.html': 'subnet', 'kayitlar.html': 'kayitlar', 'bakim.html': 'bakim', 'giris.html': 'bakim'
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

  // ---- Genel düğme kaydı: sayfadaki TÜM düğme tıklamaları otomatik loglanır ----
  // Kendi detaylı kaydını atan düğmeler burada atlanır (çift kayıt olmasın diye)
  const OZEL_KAYITLI = ['yenile', 'hesapla', 'gecmisTemizle', 'csvBtn'];
  document.addEventListener('click', function (e) {
    const btn = e.target.closest && e.target.closest('button');
    if (!btn) return;
    if (t.dataset && t.dataset.log === 'ozel') return;
    if (OZEL_KAYITLI.indexOf(btn.id) !== -1 || btn.classList.contains('sn-kopya') || btn.dataset.log === 'ozel') return;
    const ad = (btn.getAttribute('aria-label') || btn.textContent || btn.id || 'isimsiz düğme').trim().replace(/\s+/g, ' ');
    window.logYaz('Buton tıklandı', ad);
  }, true);

  // Açma/kapama kutucukları (ör. otomatik yenileme)
  document.addEventListener('change', function (e) {
    const t = e.target;
    if (!t.matches || !t.matches('input[type=checkbox]')) return;
    const etiket = ((t.closest('label') && t.closest('label').textContent) || t.id || 'ayar').trim();
    window.logYaz('Ayar değiştirildi', etiket + ': ' + (t.checked ? 'açık' : 'kapalı'));
  }, true);
})();
