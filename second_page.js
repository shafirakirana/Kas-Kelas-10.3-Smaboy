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

  const formTransaksi = document.getElementById('formTransaksi');
  const inputKeterangan = document.getElementById('keterangan');
  const inputNominal = document.getElementById('nominal');
  const selectTipe = document.getElementById('tipe');
  const tabelTransaksi = document.getElementById('tabelTransaksi');

  // BUKA FORM: Pastikan form selalu terlihat
  if (formTransaksi) {
    formTransaksi.style.display = 'block';
  }

  // Simpan Transaksi ke Firebase
  if (formTransaksi) {
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
          alert("Transaksi berhasil disimpan!");
        }).catch((err) => {
          alert("Gagal menyimpan data: " + err.message);
        });
      }
    });
  }

  // Muat Data Transaksi secara Realtime dari Firebase
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
      row.innerHTML = `
        <td style="padding: 10px 5px; font-size: 13px;">${data.tanggal}</td>
        <td style="padding: 10px 5px; font-size: 13px;">${data.keterangan}</td>
        <td style="padding: 10px 5px; font-size: 13px; color: ${data.tipe === 'pemasukan' ? '#4ade80' : '#f87171'}; font-weight: bold;">
          ${data.tipe === 'pemasukan' ? '+' : '-'} Rp ${data.nominal.toLocaleString('id-ID')}
        </td>
        <td style="padding: 10px 5px;"><button onclick="hapusTransaksi('${key}')" style="background: #ef4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;">Hapus</button></td>
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

  // Fungsi Hapus Transaksi
  window.hapusTransaksi = (key) => {
    if (confirm("Yakin ingin menghapus transaksi ini?")) {
      database.ref('transaksi_kas/' + key).remove();
    }
  };
});
