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
