# Panduan Penggunaan Sistem Deklarasi & WBS

## 1. Pendahuluan
**Sistem Deklarasi dan Whistleblowing System (WBS)** adalah platform digital terpadu yang dirancang untuk menjaga integritas institusi. Sistem ini memfasilitasi pelaporan tindakan pelanggaran secara anonim (WBS) dan proses pendataan resmi terkait kondisi benturan kepentingan atau penerimaan fasilitas secara terpaksa (Deklarasi) bagi internal pegawai. Sistem ini menjamin kerahasiaan identitas, keamanan data, dan kemudahan dalam melacak tindak lanjut dari setiap pelaporan.

---

## 2. Hak Akses: Pandangan sebagai USER dan ADMIN
Platform ini dirancang dengan pemisahan peran yang tegas untuk menjaga keamanan informasi dan transparansi proses.

### 👤 Sebagai USER (Pegawai / Pelapor)
Bagi pengguna umum atau pelapor, sistem didesain agar **mudah diakses tanpa perlu membuat akun (tanpa login)**.
- **Perlindungan Penuh**: Fokus utama untuk pengguna adalah keamanan. Pelapor WBS tidak akan dilacak identitas maupun IP Address-nya (100% anonim). Pegawai yang melakukan Deklarasi dilindungi datanya sebagai bentuk itikad baik.
- **Kemandirian (Self-Service)**: Pengguna memiliki kendali untuk melacak sejauh mana laporan mereka diproses secara mandiri menggunakan fitur "Cek Tiket" bermodalkan Nomor ID Tiket yang mereka dapatkan saat melakukan *submit*.

### 🛡️ Sebagai ADMIN (Petugas / Validator)
Bagi petugas pengelola, sistem menyediakan "Pintu Belakang" (*Admin Dashboard*) yang **diamankan oleh sistem otentikasi (login)**.
- **Kendali Terpusat**: Admin memiliki wewenang untuk melihat seluruh daftar tiket masuk (baik Deklarasi maupun Laporan WBS).
- **Manajemen Resolusi**: Admin bertugas memverifikasi laporan yang masuk, menindaklanjuti, serta memperbarui status tiket (misal: memindahkan status dari *Diterima* menjadi *Sedang Diproses* atau *Selesai*).
- **Visibilitas Bukti**: Admin dapat melihat lampiran bukti (foto/dokumen) serta rekaman tanda tangan digital yang dikirimkan oleh pengguna guna keperluan audit.

---

## 3. Navigasi Utama
Berikut adalah menu dan halaman utama yang tersedia di dalam aplikasi:

- **Beranda (Home)**: Halaman utama aplikasi yang memuat informasi singkat, nilai-nilai integritas, serta tombol aksi cepat untuk langsung menuju form Deklarasi atau form Lapor.
- **Deklarasi**: Halaman berisi formulir resmi yang harus diisi secara transparan oleh pegawai untuk menyatakan kondisi benturan kepentingan/keterpaksaan.
- **Lapor (WBS)**: Halaman form pelaporan pelanggaran (misal: korupsi, pelecehan, pelanggaran prosedur) yang didesain **100% anonim** (tanpa pendataan profil pelapor).
- **Cek Tiket**: Fasilitas pelacakan mandiri. Pengguna dapat mengetahui sejauh mana progres/status laporannya sedang diproses oleh admin secara *real-time*.
- **Admin Dashboard**: (Khusus Petugas/Admin) Panel kendali terpusat untuk memantau semua tiket masuk, memverifikasi, mengubah status tiket, dan melihat statistik laporan.

---

## 4. Panduan Fitur Inti (Step-by-Step)

### A. Mengajukan Form Deklarasi Keterpaksaan
Fitur ini digunakan apabila Anda berada dalam kondisi terpaksa (misal: menerima bingkisan yang tidak bisa ditolak) dan ingin mendeklarasikannya secara sah agar terlindungi dari sanksi.

1. Buka menu **Deklarasi** dari bilah navigasi (atas).
2. **Tahap 1 (Data Diri)**: Isi kelengkapan data pribadi dan instansi Anda (Nama, NIP, Jabatan, Unit Kerja). Klik "Selanjutnya".
3. **Tahap 2 (Kuesioner)**: Jawablah 5 pertanyaan utama mengenai detail situasi benturan kepentingan/gratifikasi yang Anda alami. Sertakan keterangan tambahan jika diperlukan. Klik "Selanjutnya".
4. **Tahap 3 (Tanda Tangan)**: Berikan tanda tangan digital Anda dengan cara menggambar di kotak *canvas* putih yang disediakan (gunakan *mouse* atau sentuhan jari di layar HP). Centang kotak pernyataan persetujuan.
5. Klik **Kirim Deklarasi**. 
6. Sistem akan menampilkan layar "Sukses" beserta **ID Tiket** (Contoh: `DKL-2026-12345`). **Simpan nomor ini** untuk melacak status deklarasi Anda nanti.

### B. Membuat Laporan Pelanggaran Anonim (WBS)
Gunakan fitur ini jika Anda mengetahui, melihat, atau mencurigai adanya pelanggaran kode etik/hukum oleh oknum di lingkungan instansi.

1. Buka menu **Lapor**.
2. Pilih **Kategori Pelanggaran** yang relevan (Korupsi, Penyuapan/Gratifikasi, Penipuan, Pelecehan, dll). 
3. Isi **Judul** laporan (ringkas) dan **Isi Laporan** secara detail (mengandung unsur Siapa, Apa, Kapan, Di Mana, dan Bagaimana).
4. Tentukan **Tanggal** dan **Waktu** kejadian, serta **Lokasi** spesifik.
5. *(Opsional)* Pada bagian Bukti Pendukung, Anda dapat mengunggah file berupa foto, dokumen, atau rekaman terkait.
6. Klik **Kirim Laporan Secara Anonim**. Identitas dan IP Address Anda tidak direkam oleh sistem.
7. Anda akan menerima **ID Tiket WBS** (Contoh: `WBS-2026-67890`). **Catat dan simpan dengan aman** karena nomor ini adalah satu-satunya cara Anda berinteraksi dengan laporan Anda.

### C. Melacak Status Tiket
Untuk mengetahui tindakan apa yang sudah dilakukan oleh instansi terhadap laporan/deklarasi Anda.

1. Buka menu **Cek Tiket**.
2. Masukkan **ID Tiket** Anda (lengkap dengan awalan DKL- atau WBS-) ke dalam kotak pencarian.
3. Klik ikon pencarian atau tekan *Enter*.
4. Anda akan melihat ringkasan detail tiket Anda beserta **Timeline Status** (contoh urutan: Diterima -> Diverifikasi -> Sedang Diproses -> Selesai).

---

## 5. Sistem Penentuan Tingkat Urgensi Tiket
Sistem ini menggunakan kecerdasan prosedural otomatis untuk menentukan seberapa mendesak (*urgent*) sebuah laporan harus ditangani oleh Admin. Apa yang menyebabkannya?

- **Form Deklarasi (Selalu RENDAH 🟢)**
  Setiap pengajuan Deklarasi secara *default* akan dilabeli dengan urgensi **Rendah**. Hal ini karena Deklarasi bersifat pencegahan, administratif, dan ditujukan sebagai bukti itikad baik (mitigasi dini). Ini bukanlah insiden gawat darurat yang membahayakan operasional secara langsung.

- **Form Laporan / WBS (Dinamis 🔴🟠🟡🟢)**
  Urgensi Laporan ditentukan *secara otomatis* oleh sistem berdasarkan **Kategori Pelanggaran** yang dipilih oleh pelapor saat mengisi formulir.
  * **KRITIS (🔴)**: Kasus yang berpotensi merusak reputasi institusi dan melanggar hukum pidana berat (Penyuapan/Gratifikasi, Korupsi).
  * **TINGGI (🟠)**: Insiden yang merugikan secara materi/moral secara signifikan (Penipuan/Kecurangan, Pelecehan/Kekerasan).
  * **SEDANG (🟡)**: Kasus yang bersifat administratif namun tetap memerlukan tindakan korektif (Konflik Kepentingan, Pelanggaran Prosedur).
  * **RENDAH (🟢)**: Kasus-kasus lain yang sifatnya aduan ringan di luar kategori di atas.

Admin akan melihat label warna-warni ini di *Dashboard* mereka, sehingga mempermudah dalam menentukan skala prioritas pengerjaan.

---

## 6. FAQ (Tanya Jawab)

**Q: Apakah identitas saya benar-benar aman saat mengirim Laporan WBS?**  
> **A:** Ya, dijamin 100% aman. Sistem WBS (Lapor) dibangun tanpa otentikasi login pengguna. Sistem tidak mencatat identitas profil, tidak melacak alamat IP (IP Address), serta tidak menyimpan *cookie* pelacakan. Hanya detail laporan yang dikirimkan.

**Q: Bagaimana jika saya kehilangan ID Tiket (WBS)? Bisakah dicari kembali?**  
> **A:** Demi keamanan kerahasiaan Anda, nomor ID Tiket WBS yang hilang **tidak dapat dipulihkan** atau dicari ulang oleh admin, karena tidak ada data profil (seperti email atau nomor telepon) yang bisa dicocokkan dengan laporan tersebut. Oleh karena itu, *sangat disarankan untuk segera menyalin (copy) ID Tiket* ke catatan aman Anda setelah berhasil melapor.

**Q: Mengapa saya kesulitan memberikan tanda tangan digital di form Deklarasi menggunakan Smartphone?**  
> **A:** Masalah ini biasanya terjadi karena fitur *zoom* bawaan layar sentuh. Pastikan Anda menyentuh persis di dalam area kotak putih tanpa menggeser (swipe) seluruh layar. Jika memungkinkan, coba putar mode layar ke posisi lanskap (*landscape*) atau ubah ukuran orientasi layar untuk memudahkan proses coretan.

**Q: Apa perbedaan utama antara form "Deklarasi" dan form "Lapor"?**  
> **A:** **Deklarasi** bersifat terbuka secara identitas (pelapor mengisi nama, NIP, dsb) untuk secara proaktif melindungi pelapor (dirinya sendiri) dari sanksi akibat terpaksa menerima gratifikasi atau berada di posisi rawan. Sebaliknya, **Lapor (WBS)** bersifat anonim penuh dan ditujukan untuk melaporkan dugaan pelanggaran yang dilakukan oleh *orang lain*. 
