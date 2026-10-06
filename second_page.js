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

  // Mengambil status bendahara dari localStorage (sama seperti di keuangan.js)
  const isBendahara = localStorage.getItem('isBendahara') === 'true';

  // Tampilkan atau sembunyikan form berdasarkan status bendahara
  if (formTransaksi) {
    if (isBendahara) {
      formTransaksi.style.display = 'block';
    } else {
      formTransaksi.style.display = 'none';
    }
  }

  // Muat data transaksi secara langsung
  muatDataTransaksi();

  // 2. Simpan Transaksi ke Firebase
  if (formTransaksi) {
    formTransaksi.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!isBendahara) {
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            icon: 'error',
            title: 'Akses Ditolak',
            text: 'Hanya bendahara yang dapat menambah transaksi!',
            background: '#1e1e1e',
            color: '#fff',
            confirmButtonColor: '#dc2626'
          });
        } else {
          alert('Hanya bendahara yang dapat menambah transaksi!');
        }
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
              timer: 2000,
              showConfirmButton: false
            });
          } else {
            alert('Transaksi berhasil disimpan!');
          }
        }).catch((err) => {
          if (typeof Swal !== 'undefined') {
            Swal.fire({
              icon: 'error',
              title: 'Gagal!',
              text: 'Gagal menyimpan data: ' + err.message,
              background: '#1e1e1e',
              color: '#fff',
              confirmButtonColor: '#dc2626'
            });
          } else {
            alert('Gagal menyimpan data: ' + err.message);
          }
        });
      }
    });
  }

  // 3. Muat Data Transaksi secara Realtime
  function muatDataTransaksi() {
    database.ref('transaksi_kas').orderByChild('timestamp').on('value', (snapshot) => {
      if (!tabelTransaksi) return;

      tabelTransaksi.innerHTML = '';
      let totalPemasukan = 0;
      let totalPengeluaran = 0;

      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        const key = childSnapshot.key;

        if (data.tipe === 'pemasukan') {
          totalPemasukan += data.nominal;
        } else {
          totalPengeluaran += data.nominal;
        }

        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid rgba(255,255,255,0.05)';

        // Tombol Hapus hanya ditampilkan jika status isBendahara = true
        const tombolHapus = isBendahara 
          ? `<button onclick="hapusTransaksi('${key}')" style="background:#dc2626; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:12px;">Hapus</button>` 
          : '';

        row.innerHTML = `
          <td style="padding: 10px 5px; font-size: 13px;">${data.tanggal}</td>
          <td style="padding: 10px 5px; font-size: 13px;">${data.keterangan}</td>
          <td style="padding: 10px 5px; font-size: 13px; color: ${data.tipe === 'pemasukan' ? '#4CAF50' : '#F44336'};">
            ${data.tipe === 'pemasukan' ? '+' : '-'} Rp ${data.nominal.toLocaleString('id-ID')}
          </td>
          <td style="padding: 10px 5px;">${tombolHapus}</td>
        `;

        tabelTransaksi.appendChild(row);
      });

      // Hitung Sisa Saldo
      const elSaldoAkhir = document.getElementById('statSaldoAkhir');
      if (elSaldoAkhir) {
        const sisaSaldo = totalPemasukan - totalPengeluaran;
        elSaldoAkhir.textContent = `Rp ${sisaSaldo.toLocaleString('id-ID')}`;
      }
    });
  }

  // 4. Fungsi Hapus Transaksi (Global Window)
  window.hapusTransaksi = (key) => {
    if (!isBendahara) {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'error',
          title: 'Akses Ditolak',
          text: 'Hanya bendahara yang dapat menghapus transaksi.',
          background: '#1e1e1e',
          color: '#fff',
          confirmButtonColor: '#dc2626'
        });
      } else {
        alert('Hanya bendahara yang dapat menghapus transaksi.');
      }
      return;
    }

    if (typeof Swal !== 'undefined') {
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
          database.ref('transaksi_kas/' + key).remove().then(() => {
            Swal.fire({
              title: 'Terhapus!',
              text: 'Transaksi berhasil dihapus.',
              icon: 'success',
              background: '#1e1e1e',
              color: '#fff',
              timer: 1500,
              showConfirmButton: false
            });
          });
        }
      });
    } else {
      if (confirm('Yakin ingin menghapus transaksi ini?')) {
        database.ref('transaksi_kas/' + key).remove();
      }
    }
  };
});
