// Canlı saat
function saatiGuncelle() {
  const s = document.getElementById('saat');
  if (s) s.textContent = new Date().toLocaleTimeString('tr-TR');
}
setInterval(saatiGuncelle, 1000);
saatiGuncelle();

// Durum yenileme: noktaları rastgele yeşil/kırmızı yap ve sonucu günlüğe yaz
document.getElementById('yenile')?.addEventListener('click', () => {
  const noktalar = document.querySelectorAll('.nokta');
  if (!noktalar.length) return;
  const arizali = [];
  noktalar.forEach(n => {
    const calisiyor = Math.random() > 0.3;
    n.style.background = calisiyor ? 'var(--yesil)' : '#e04848';
    if (!calisiyor) arizali.push(n.parentElement.textContent.trim());
  });
  if (window.logYaz) logYaz('Durum yenilendi', arizali.length ? 'Arızalı: ' + arizali.join(', ') : 'Tüm sunucular çalışıyor');
});

// Aktif kullanıcı sayısını 1 dakikada bir 1-100 arası rastgele güncelle
function kullaniciSayisiniGuncelle() {
  const el = document.getElementById('aktif-kullanici');
  if (!el) return;
  const eski = el.textContent;
  const yeni = Math.floor(Math.random() * 100) + 1;
  el.textContent = yeni;
  if (window.logYaz) logYaz('Kullanıcı sayısı güncellendi', 'Aktif kullanıcı: ' + eski + ' → ' + yeni);
}
setInterval(kullaniciSayisiniGuncelle, 60000); // 60000 ms = 1 dakika
kullaniciSayisiniGuncelle(); // sayfa açılır açılmaz bir kez çalışsın
