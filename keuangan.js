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
  const auth = firebase.auth();

  const formTransaksi = document.getElementById('formTransaksi');
  const inputKeterangan = document.getElementById('keterangan');
  const inputNominal = document.getElementById('nominal');
  const selectTipe = document.getElementById('tipe');
  const tabelTransaksi = document.getElementById('tabelTransaksi');

  let isBendahara = false;

  // Sembunyikan form secara default sebelum validasi role
  if (formTransaksi) {
    formTransaksi.style.display = 'none';
  }

  // 2. Cek Otentikasi & Hak Akses Bendahara
  auth.onAuthStateChanged((user) => {
    if (user) {
      // Cek peran user di Realtime Database (/users/{uid}/role)
      database.ref('users/' + user.uid).once('value').then((snapshot) => {
        const userData = snapshot.val();
        if (userData && userData.role === 'bendahara') {
          isBendahara = true;
          if (formTransaksi) formTransaksi.style.display = 'block';
        } else {
          isBendahara = false;
          if (formTransaksi) formTransaksi.style.display = 'none';
        }
        muatDataTransaksi();
      }).catch(() => {
        isBendahara = false;
        if (formTransaksi) formTransaksi.style.display = 'none';
        muatDataTransaksi();
      });
    } else {
      isBendahara = false;
      if (formTransaksi) formTransaksi.style.display = 'none';
      muatDataTransaksi();
    }
  });

  // 3. Simpan Transaksi ke Firebase (Hanya jika Bendahara)
  if (formTransaksi) {
    formTransaksi.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!isBendahara) {
        Swal.fire({
          icon: 'error',
          title: 'Akses Ditolak',
          text: 'Hanya bendahara yang dapat menambah transaksi!',
          background: '#1e1e1e',
          color: '#fff',
          confirmButtonColor: '#dc2626'
        });
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
        }).catch((err) => {
          Swal.fire({
            icon: 'error',
            title: 'Gagal!',
            text: 'Gagal menyimpan data: ' + err.message,
            background: '#1e1e1e',
            color: '#fff',
            confirmButtonColor: '#dc2626'
          });
        });
      }
    });
  }

  // 4. Muat Data Transaksi secara Realtime
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

        // Tombol Hapus hanya ditampilkan jika user adalah Bendahara
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

  // 5. Fungsi Hapus Transaksi (Global Window)
  window.hapusTransaksi = (key) => {
    if (!isBendahara) {
      Swal.fire({
        icon: 'error',
        title: 'Akses Ditolak',
        text: 'Hanya bendahara yang dapat menghapus transaksi.',
        background: '#1e1e1e',
        color: '#fff',
        confirmButtonColor: '#dc2626'
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
  };
});
