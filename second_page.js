document.addEventListener('DOMContentLoaded', () => {
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

  // Cek status bendahara
  const isBendahara = localStorage.getItem('isBendahara') === 'true';

  // Sembunyikan form jika BUKAN bendahara
  if (formTransaksi) {
    if (isBendahara) {
      formTransaksi.style.display = 'block';
    } else {
      formTransaksi.style.display = 'none';
    }
  }

  // Langsung tampilkan riwayat transaksi
  muatDataTransaksi();

  // Simpan Transaksi
  if (formTransaksi) {
    formTransaksi.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!isBendahara) {
        Swal.fire({
          icon: 'error',
          title: 'Akses Ditolak',
          text: 'Hanya bendahara yang dapat menambah transaksi!',
          background: '#1e1e1e',
          color: '#fff'
        });
        return;
      }

      const keterangan = inputKeterangan.value.trim();
      const nominal = parseInt(inputNominal.value);
      const tipe = selectTipe.value;
      const tanggal = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

      if (!keterangan || isNaN(nominal)) {
        Swal.fire({
          icon: 'warning',
          title: 'Data Belum Lengkap',
          text: 'Harap isi keterangan dan nominal transaksi!',
          background: '#1e1e1e',
          color: '#fff'
        });
        return;
      }

      const newRef = database.ref('transaksi_kas').push();
      newRef.set({
        keterangan: keterangan,
        nominal: nominal,
        tipe: tipe,
        tanggal: tanggal,
        timestamp: Date.now()
      }).then(() => {
        formTransaksi.reset();
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Transaksi berhasil disimpan',
          background: '#1e1e1e',
          color: '#fff',
          timer: 1500,
          showConfirmButton: false
        });
      }).catch((err) => {
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: err.message,
          background: '#1e1e1e',
          color: '#fff'
        });
      });
    });
  }

  // Fungsi memuat data secara Realtime
  function muatDataTransaksi() {
    database.ref('transaksi_kas').orderByChild('timestamp').on('value', (snapshot) => {
      if (!tabelTransaksi) return;

      tabelTransaksi.innerHTML = '';
      let totalPemasukan = 0;
      let totalPengeluaran = 0;

      if (!snapshot.exists()) {
        tabelTransaksi.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:15px; color:#94a3b8;">Belum ada data transaksi</td></tr>';
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

        const tombolHapus = isBendahara 
          ? `<button onclick="hapusTransaksi('${key}')" style="background:#dc2626; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:12px;">Hapus</button>` 
          : '-';

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

  // Fungsi Hapus Transaksi
  window.hapusTransaksi = (key) => {
    if (!isBendahara) {
      Swal.fire({
        icon: 'error',
        title: 'Akses Ditolak',
        text: 'Hanya bendahara yang dapat menghapus transaksi.',
        background: '#1e1e1e',
        color: '#fff'
      });
      return;
    }

    Swal.fire({
      title: 'Hapus Transaksi?',
      text: 'Data yang dihapus tidak bisa dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#4b5563',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
      background: '#1e1e1e',
      color: '#fff'
    }).then((result) => {
      if (result.isConfirmed) {
        database.ref('transaksi_kas/' + key).remove();
      }
    });
  };
});
