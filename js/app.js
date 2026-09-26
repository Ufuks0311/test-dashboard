// Canlı saat
function saatiGuncelle() {
  const s = document.getElementById('saat');
  if (s) s.textContent = new Date().toLocaleTimeString('tr-TR');
}
setInterval(saatiGuncelle, 1000);
saatiGuncelle();

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
