# Kalender Bali → GitHub Pages → KWGT

Script GitHub Actions membuka KalenderBali.org setiap hari memakai Chromium/Playwright,
mengambil Sapta Wara, Panca Wara, Wuku, dan semua rerahinan tanggal tersebut,
lalu membuat `today.txt` dan `today.json`.

## Formula KWGT
`$wg("https://cgxmailbox.github.io/klender-bali-widget-klwp/today.txt",txt)$`

## Pasang
1. Extract ZIP.
2. Di repo GitHub tekan **uploading an existing file**.
3. Upload seluruh isi hasil extract lalu **Commit changes**.
4. Settings → Pages → Deploy from a branch → `main` → `/(root)`.
5. Actions → **Update Kalender Bali** → **Run workflow**.
6. Tunggu sampai hijau.
7. Buka `https://cgxmailbox.github.io/klender-bali-widget-klwp/today.txt`

## Catatan
KalenderBali.org memakai proteksi anti-bot. Script memakai browser Chromium sungguhan.
Jika situs memblokir GitHub Actions atau struktur halaman berubah, workflow akan gagal
daripada menimpa `today.txt` dengan data salah.
