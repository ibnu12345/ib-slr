# DOKUMEN KREDENSIAL AKUN PENGUJIAN & PANDUAN TRANSAKSI (FOR MIDTRANS AUDIT)
**Platform SaaS: IB-SLR (*From Literature to Evidence*)**  
*Website Resmi: [https://ib-slr-app.vercel.app](https://ib-slr-app.vercel.app)*  
*Dokumen: Lampiran Data Tambahan Onboarding Midtrans*  

---

## 1. MAKSUD & TUJUAN DOKUMEN
Dokumen ini disusun untuk memenuhi persyaratan **Formulir Data Tambahan Onboarding Merchant Midtrans**, yaitu menyediakan kredensial akun pengujian agar tim verifikator / risk management Midtrans dapat mengakses sistem platform IB-SLR dan menguji secara langsung alur transaksi pembayaran (*test transaction*).

---

## 2. KREDENSIAL AKUN PENGUJIAN (TEST CREDENTIALS)

* **URL Halaman Login:** [https://ib-slr-app.vercel.app/login](https://ib-slr-app.vercel.app/login)
* **Email Akun Tester:** `pro@ib-slr.com`
* **Kata Sandi (Password):** `ProPass123!`
* **Peran Akun:** Pengguna Aktif (Standard Researcher User)

> *Catatan Tambahan:* Tim verifikator Midtrans juga dapat melakukan registrasi akun baru mandiri secara langsung melalui halaman registrasi publik di: [https://ib-slr-app.vercel.app/register](https://ib-slr-app.vercel.app/register).

---

## 3. PANDUAN LANGKAH PENGUJIAN ALUR TRANSAKSI (STEP-BY-STEP TEST FLOW)

1. **Masuk ke Akun (Login):**
   * Buka peramban (browser) dan akses: `https://ib-slr-app.vercel.app/login`.
   * Masukkan email: `pro@ib-slr.com` dan password: `ProPass123!`, lalu tekan **"Masuk ke Akun"**.

2. **Menuju Halaman Paket / Top-Up:**
   * Di bilah navigasi atas atau menu utama, klik menu **"Pricing"** (atau akses langsung `https://ib-slr-app.vercel.app#pricing`).
   * Alternatif lain: Pada dashboard utama, klik tombol **"Top Up Project Pass"** atau **"Buat Proyek Baru"**.

3. **Inisiasi Pembayaran (Checkout):**
   * Pilih salah satu paket yang tersedia, contohnya paket **Pay-Per-Project Pass (Rp 20.000)** atau **Professional Researcher Plan (Rp 450.000)**.
   * Klik tombol **"Beli Sekarang"** / **"Top Up"**.

4. **Pengujian Antarmuka Pembayaran Midtrans Snap:**
   * Modal dialog antarmuka pembayaran resmi **Midtrans Snap / QRIS** akan otomatis terbuka di layar.
   * Tim verifikator dapat meninjau metode pembayaran aktif (QRIS, Virtual Account Bank BCA/Mandiri/BRI/BNI, dan E-Wallet) dan memeriksa kelancaran generasi token transaksi.

---
*Kontak Pengelola Platform:*  
*Email: ibnusetiawan1928@gmail.com*  
*Website: [https://ib-slr-app.vercel.app](https://ib-slr-app.vercel.app)*
