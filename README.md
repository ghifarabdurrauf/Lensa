# Lensa · Fase 1

Pelacak lowongan kerja, beasiswa S2, dan kampus S2 dalam satu tempat. Tiga bahasa (ID, EN, FR), nyaman di HP, iPad, dan laptop. Desain opsi E (Liquid Glass) dengan palet Sage, Pasir, dan Batu.

Fase 1 sepenuhnya gratis dan **tidak memakai Google Cloud**:

| Bagian | Layanan | Biaya |
|---|---|---|
| Kode website | Next.js 15 | gratis |
| Database dan login | Supabase (paket Free) | gratis |
| Hosting | Vercel (paket Hobby) | gratis |
| Penyimpanan kode | GitHub | gratis |

## Isi fase 1

- Masuk lewat tautan email atau akun GitHub, plus mode demo tanpa akun
- Tiga jalur: Lowongan, Beasiswa, Universitas. Tambah, ubah, hapus
- Tampilan papan (geser kartu antar status) dan tampilan daftar
- Riwayat status otomatis, favorit, pencarian, filter, urutkan
- Halaman Ringkasan: tenggat berikutnya, kemajuan per jalur, kalender bulan ini, 7 hari ke depan
- Pengaturan: nama, bahasa, tema terang/gelap/otomatis, palet warna, unduh CSV

## Struktur folder

```
src/
  app/[locale]/           halaman (id, en, fr)
    page.tsx              Ringkasan
    jobs/ scholarships/ universities/
    settings/ login/ auth/callback/
  components/             Shell (navigasi), TrackView (papan & daftar), ItemForm, ItemDetail
  lib/
    i18n.ts               semua teks tiga bahasa
    repo.ts               akses data: Supabase atau mode demo
    types.ts              jenis data dan daftar status
    demo-data.ts          13 contoh data untuk mode demo
  app/globals.css         seluruh tampilan (warna, kaca, tata letak)
supabase/migrations/0001_fase1.sql   tabel, keamanan, trigger
```

## Tahap 1 · Menjalankan di laptop (mode demo)

1. Pasang **Node.js versi LTS** dari https://nodejs.org (versi 20 atau lebih baru).
2. Pasang **VS Code** dari https://code.visualstudio.com.
3. Ekstrak zip ini, buka foldernya di VS Code, lalu buka Terminal (menu Terminal > New Terminal).
4. Jalankan:
   ```
   npm install
   npm run dev
   ```
5. Buka http://localhost:3000. Karena database belum disambungkan, Lensa otomatis masuk mode demo dengan data contoh. Data demo hanya tersimpan di browser itu.

Untuk menghentikan server: tekan `Ctrl + C` di terminal.

## Tahap 2 · Membuat database di Supabase

1. Daftar di https://supabase.com (bisa pakai akun GitHub), lalu **New project**.
   Region: **Southeast Asia (Singapore)**. Simpan password database di tempat aman.
2. Buka **SQL Editor > New query**, tempel seluruh isi `supabase/migrations/0001_fase1.sql`, klik **Run**.
   Harus muncul "Success. No rows returned".
3. **Authentication > Sign In / Providers**: pastikan **Email** aktif.
4. **Authentication > URL Configuration**:
   - Site URL: `http://localhost:3000` (nanti diganti alamat Vercel)
   - Redirect URLs: tambahkan `http://localhost:3000/**`

Login GitHub (opsional):
1. Di GitHub: Settings > Developer settings > OAuth Apps > New OAuth App.
2. Homepage URL: `http://localhost:3000`. Authorization callback URL: salin dari Supabase (Authentication > Providers > GitHub, bentuknya `https://xxxx.supabase.co/auth/v1/callback`).
3. Salin Client ID dan Client Secret ke Supabase, lalu aktifkan GitHub.

## Tahap 3 · Menyambungkan website ke database

1. Di Supabase: **Project Settings > API**. Salin **Project URL** dan **anon public key**.
2. Di folder Lensa, salin `.env.example` menjadi `.env.local`, lalu isi:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
3. Hentikan `npm run dev` (Ctrl + C) lalu jalankan lagi. Sekarang muncul halaman masuk.
4. Masukkan email, buka tautan yang dikirim Supabase, dan kamu masuk dengan data kosong milikmu sendiri.

Catatan: email bawaan Supabase dibatasi sekitar beberapa email per jam. Cukup untuk pemakaian pribadi. Jika nanti banyak pengguna, sambungkan SMTP sendiri (misalnya Resend, gratis 3.000 email per bulan).

`.env.local` tidak ikut ke GitHub (sudah ada di `.gitignore`). Anon key memang aman dipakai di browser karena setiap tabel dilindungi Row Level Security: pengguna hanya bisa membaca datanya sendiri.

## Tahap 4 · Menyimpan kode ke GitHub

1. Buat repository baru di https://github.com/new, misalnya `lensa` (boleh Private).
2. Di terminal folder Lensa:
   ```
   git init
   git add .
   git commit -m "Lensa fase 1"
   git branch -M main
   git remote add origin https://github.com/USERNAME/lensa.git
   git push -u origin main
   ```

## Tahap 5 · Menerbitkan ke Vercel

1. Masuk ke https://vercel.com dengan akun GitHub. **Add New > Project**, pilih repo `lensa`, klik **Import**.
2. Buka **Environment Variables**, isi dua variabel yang sama seperti `.env.local`.
3. Klik **Deploy**. Setelah selesai kamu mendapat alamat seperti `https://lensa-xxx.vercel.app`.
4. Kembali ke Supabase **Authentication > URL Configuration**:
   - Site URL: `https://lensa-xxx.vercel.app`
   - Redirect URLs: tambahkan `https://lensa-xxx.vercel.app/**` (yang localhost biarkan)
5. Jika memakai GitHub login, perbarui Homepage URL di OAuth App GitHub ke alamat Vercel.

Setiap kali kamu `git push`, Vercel menerbitkan versi baru secara otomatis.

## Tahap 6 · Daftar uji

- [ ] Masuk dengan email di HP, iPad, dan laptop
- [ ] Tambah satu lowongan, satu beasiswa, satu kampus
- [ ] Ubah status lewat papan (geser kartu) dan lewat panel detail
- [ ] Riwayat status bertambah di panel detail
- [ ] Bintang favorit tersimpan setelah halaman dimuat ulang
- [ ] Ganti bahasa ID, EN, FR
- [ ] Ganti tema dan palet di Pengaturan
- [ ] Unduh CSV lalu buka di Excel atau Google Sheets
- [ ] Keluar, lalu masuk lagi: data masih ada
- [ ] Di iPhone: Safari > Bagikan > Tambah ke Layar Utama

## Perintah yang sering dipakai

| Perintah | Fungsi |
|---|---|
| `npm run dev` | menjalankan versi pengembangan di localhost:3000 |
| `npm run build` | mengecek dan menyusun versi produksi |
| `npm run start` | menjalankan hasil build |
| `npm run lint` | mengecek gaya kode |

## Hal yang perlu diingat

- Proyek Supabase gratis akan **dijeda setelah 7 hari tanpa aktivitas**. Cukup buka dashboard Supabase dan klik Restore. Membuka website secara rutin juga mencegah jeda.
- Mode demo bisa dipakai kapan saja lewat tombol "Coba tanpa akun". Datanya terpisah dari akun asli.

## Fase berikutnya

- Fase 2: pengingat Gmail H-7 dan H-1, Google Calendar atau langganan .ics, perpustakaan dokumen
- Fase 3: ekspor ke Google Sheets, bagikan ke WhatsApp, tempel tautan lowongan untuk isi otomatis, perbandingan, PWA
