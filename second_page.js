document.addEventListener('DOMContentLoaded', () => {
  // 1. Konfigurasi Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyD0o1p4qJ5DNDHg3-DRN32",
    authDomain: "kas-kelas-smaboy.firebaseapp.com",
    databaseURL: "https://kas-kelas-smaboy-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "kas-kelas-smaboy",
    storageBucket: "kas-kelas-smaboy.firebasestorage.app",
    messagingSenderId: "243723103471",
    appId: "1:243723103471:web:cdab29a7"
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const database = firebase.database();

  const formTransaksi = document.getElementById('formTransaksi');
  const inputKeterangan = document.getElementById('keterangan');
  const inputNominal = document.getElementById('nominal');
  const selectTipe = document.getElementById('tipe');
  const tabelTransaksi = document.getElementById('tabelTransaksi');

  // Cek apakah user adalah bendahara dari localStorage
  const isBendahara = localStorage.getItem('isBendahara') === 'true';

  // ATUR TAMPILAN FORM: Hanya bendahara yang bisa lihat form tambah transaksi
  if (formTransaksi) {
    if (isBendahara) {
      formTransaksi.style.display = 'block';
    } else {
      formTransaksi.style.display = 'none'; // Sembunyikan jika bukan bendahara
    }
  }

  // Langsung muat data agar siswa/bendahara bisa lihat riwayat transaksi
  muatDataTransaksi();

  // 2. Simpan Transaksi (Hanya Bendahara)
  if (formTransaksi) {
    formTransaksi.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!isBendahara) {
        alert('Akses ditolak! Hanya bendahara yang dapat menambah transaksi.');
        return;
      }

      const keterangan = inputKeterangan.value.trim();
      const nominal = parseInt(inputNominal.value);
      const tipe = selectTipe.value;
      const tanggal = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

      if (keterangan && !isNaN(nominal)) {
        const newRef = database.ref('transaksi_kas').push();
        newRef.set({
          keterangan: keterangan,
          nominal: nominal,
          tipe: tipe,
          tanggal: tanggal,
          timestamp: Date.now()
        }).then(() => {
          formTransaksi.reset();
          if (typeof Swal !== 'undefined') {
            Swal.fire({
              icon: 'success',
              title: 'Berhasil!',
              text: 'Transaksi berhasil disimpan',
              background: '#1e1e1e',
              color: '#fff',
              confirmButtonColor: '#2563eb',
              timer: 1500,
              showConfirmButton: false
            });
          } else {
            alert('Transaksi berhasil disimpan!');
          }
        }).catch((err) => {
          alert('Gagal menyimpan data: ' + err.message);
        });
      }
    });
  }

  // 3. Muat Data Transaksi secara Realtime
  function muatDataTransaksi() {
    database.ref('transaksi_kas').on('value', (snapshot) => {
      if (!tabelTransaksi) return;

      tabelTransaksi.innerHTML = '';
      let totalPemasukan = 0;
      let totalPengeluaran = 0;

      if (!snapshot.exists()) {
        tabelTransaksi.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:15px; color:#aaa;">Belum ada data transaksi</td></tr>';
        updateSaldo(0);
        return;
      }

      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        const key = childSnapshot.key;

        const nominal = parseInt(data.nominal) || 0;
        const tipe = data.tipe || 'pemasukan';
        const keterangan = data.keterangan || '-';
        const tanggal = data.tanggal || '-';

        if (tipe === 'pemasukan') {
          totalPemasukan += nominal;
        } else {
          totalPengeluaran += nominal;
        }

        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid rgba(255,255,255,0.05)';

        // Tombol Hapus HANYA muncul jika isBendahara = true
        const tombolHapus = isBendahara 
          ? `<button onclick="hapusTransaksi('${key}')" style="background:#dc2626; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:12px;">Hapus</button>` 
          : '';

        row.innerHTML = `
          <td style="padding: 10px 5px; font-size: 13px;">${tanggal}</td>
          <td style="padding: 10px 5px; font-size: 13px;">${keterangan}</td>
          <td style="padding: 10px 5px; font-size: 13px; color: ${tipe === 'pemasukan' ? '#4CAF50' : '#F44336'};">
            ${tipe === 'pemasukan' ? '+' : '-'} Rp ${nominal.toLocaleString('id-ID')}
          </td>
          <td style="padding: 10px 5px;">${tombolHapus}</td>
        `;

        tabelTransaksi.appendChild(row);
      });

      updateSaldo(totalPemasukan - totalPengeluaran);
    });
  }

  function updateSaldo(sisaSaldo) {
    const elSaldoAkhir = document.getElementById('statSaldoAkhir');
    if (elSaldoAkhir) {
      elSaldoAkhir.textContent = `Rp ${sisaSaldo.toLocaleString('id-ID')}`;
    }
  }

  // 4. Fungsi Hapus Transaksi (Hanya Bendahara)
  window.hapusTransaksi = (key) => {
    if (!isBendahara) {
      alert('Akses ditolak! Hanya bendahara yang dapat menghapus transaksi.');
      return;
    }

    if (confirm('Yakin ingin menghapus transaksi ini?')) {
      database.ref('transaksi_kas/' + key).remove();
    }
  };
});
