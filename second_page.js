document.addEventListener('DOMContentLoaded', () => {
  // Konfigurasi Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyDDlpRq4J5BWDhgS-0Nm32",
    authDomain: "kas-kelas-smaboy.firebaseapp.com",
    databaseURL: "https://kas-kelas-smaboy-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "kas-kelas-smaboy",
    storageBucket: "kas-kelas-smaboy.firebasestorage.app",
    messagingSenderId: "245725183471",
    appId: "1:245725183471:web:c4ab29a7"
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const database = firebase.database();

  const isBendahara = localStorage.getItem('isBendahara') === 'true';

  // Elemen Form & Input
  const formTransaksi = document.getElementById('formTransaksi');
  const inputKeterangan = document.getElementById('keterangan');
  const inputNominal = document.getElementById('nominal');
  const selectTipe = document.getElementById('tipe'); // 'pemasukan' atau 'pengeluaran'
  const btnSubmit = document.getElementById('btnSubmit');
  const tabelTransaksi = document.getElementById('tabelTransaksi');

  // Proteksi Akses Form
  if (!isBendahara) {
    if (formTransaksi) formTransaksi.style.display = 'none'; // Sembunyikan form jika siswa biasa
  }

  // Simpan Transaksi ke Firebase
  if (formTransaksi && isBendahara) {
    formTransaksi.addEventListener('submit', (e) => {
      e.preventDefault();

      const keterangan = inputKeterangan.value.trim();
      const nominal = parseInt(inputNominal.value);
      const tipe = selectTipe.value;
      const tanggal = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

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
        }).catch((err) => {
          alert("Gagal menyimpan data: " + err.message);
        });
      }
    });
  }

  // Muat Data Transaksi secara Realtime
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
      row.innerHTML = `
        <td>${data.tanggal}</td>
        <td>${data.keterangan}</td>
        <td style="color: ${data.tipe === 'pemasukan' ? 'green' : 'red'}; font-weight: bold;">
          ${data.tipe === 'pemasukan' ? '+' : '-'} Rp ${data.nominal.toLocaleString('id-ID')}
        </td>
        ${isBendahara ? `<td><button onclick="hapusTransaksi('${key}')" style="color:red; cursor:pointer;">Hapus</button></td>` : ''}
      `;
      tabelTransaksi.appendChild(row);
    });

    // Update Ringkasan Saldo jika ada elemen indikatornya
    const elPemasukan = document.getElementById('statPemasukan');
    const elPengeluaran = document.getElementById('statPengeluaran');
    const elSaldoAkhir = document.getElementById('statSaldoAkhir');

    if (elPemasukan) elPemasukan.textContent = `Rp ${totalPemasukan.toLocaleString('id-ID')}`;
    if (elPengeluaran) elPengeluaran.textContent = `Rp ${totalPengeluaran.toLocaleString('id-ID')}`;
    if (elSaldoAkhir) elSaldoAkhir.textContent = `Rp ${(totalPemasukan - totalPengeluaran).toLocaleString('id-ID')}`;
  });

  // Fungsi Global Hapus Transaksi (Khusus Bendahara)
  window.hapusTransaksi = (key) => {
    if (isBendahara && confirm("Hapus transaksi ini?")) {
      database.ref('transaksi_kas/' + key).remove();
    }
  };
});
