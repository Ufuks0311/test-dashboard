// Canlı saat
function saatiGuncelle() {
  const s = document.getElementById('saat');
  if (s) s.textContent = new Date().toLocaleTimeString('tr-TR');
}
setInterval(saatiGuncelle, 1000);
saatiGuncelle();

// Durum yenileme: noktaları rastgele yeşil/kırmızı yap
document.getElementById('yenile')?.addEventListener('click', () => {
  document.querySelectorAll('.nokta').forEach(n => {
    n.style.background = Math.random() > 0.3 ? 'var(--yesil)' : '#e04848';
  });
});

// Aktif kullanıcı sayısını 1 dakikada bir 1-100 arası rastgele güncelle
function kullaniciSayisiniGuncelle() {
  const el = document.getElementById('aktif-kullanici');
  if (el) el.textContent = Math.floor(Math.random() * 100) + 1;
}
setInterval(kullaniciSayisiniGuncelle, 60000); // 60000 ms = 1 dakika
kullaniciSayisiniGuncelle(); // sayfa açılır açılmaz bir kez çalışsın
