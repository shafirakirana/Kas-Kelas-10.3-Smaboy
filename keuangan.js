document.addEventListener('DOMContentLoaded', () => {
  // Konfigurasi Firebase proyek kas-kelas-smaboy
  const firebaseConfig = {
    apiKey: "AIzaSyDDlpRq4J5BWDhgS-0Nm32",
    authDomain: "kas-kelas-smaboy.firebaseapp.com",
    databaseURL: "https://kas-kelas-smaboy-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "kas-kelas-smaboy",
    storageBucket: "kas-kelas-smaboy.firebasestorage.app",
    messagingSenderId: "245725183471",
    appId: "1:245725183471:web:c4ab29a7"
  };

  // Inisialisasi Firebase
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const database = firebase.database();

  const isBendahara = localStorage.getItem('isBendahara') === 'true';
  const barisSiswa = document.querySelectorAll('table tr:not(.header)');
  const searchInput = document.getElementById('searchInput');

  const NOMINAL_PER_MINGGU = 5000;

  const labelBulan = document.getElementById('labelBulan');
  const btnPrev = document.getElementById('btnBulanPrev');
  const btnNext = document.getElementById('btnBulanNext');

  const daftarBulan = [
    "JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI",
    "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"
  ];

  let bulanIndex = 0;
  let tahunAktif = 2026;

  function hitungRingkasan() {
    const totalSiswa = barisSiswa.length;
    let totalCentangBulanIni = 0;
    let jumlahSiswaLunasBulanIni = 0;

    barisSiswa.forEach(baris => {
      const buttons = baris.querySelectorAll('button');
      let centangSiswa = 0;

      buttons.forEach(btn => {
        if (btn.classList.contains('lunas')) {
          centangSiswa++;
          totalCentangBulanIni++;
        }
      });

      if (centangSiswa === 4) {
        jumlahSiswaLunasBulanIni++;
      }
    });

    const totalUang = totalCentangBulanIni * NOMINAL_PER_MINGGU;
    const elTotalUang = document.getElementById('statTotalUang');
    const elSiswaLunas = document.getElementById('statSiswaLunas');

    if (elTotalUang) {
      elTotalUang.textContent = `Rp ${totalUang.toLocaleString('id-ID')}`;
    }
    if (elSiswaLunas) {
      elSiswaLunas.textContent = `${jumlahSiswaLunasBulanIni} / ${totalSiswa}`;
    }
  }

  function buatDataKas() {
    const namaBulanAktif = daftarBulan[bulanIndex];
    if (labelBulan) {
      labelBulan.textContent = `${namaBulanAktif} ${tahunAktif}`;
    }

    // Dengarkan perubahan data dari Firebase secara Realtime
    database.ref('kas_kelas').on('value', (snapshot) => {
      const dataKas = snapshot.val() || {};

      barisSiswa.forEach((baris, indexSiswa) => {
        const buttons = baris.querySelectorAll('button');

        buttons.forEach((btn, indexMinggu) => {
          const keyStorage = `kas_${tahunAktif}_${namaBulanAktif}_siswa_${indexSiswa}_minggu_${indexMinggu}`;
          const dataSaved = dataKas[keyStorage];

          btn.classList.remove('lunas');
          btn.innerHTML = '';

          if (dataSaved && dataSaved.status === true) {
            btn.classList.add('lunas');
            if (dataSaved.tanggal) {
              btn.innerHTML = `<span style="font-size: 8px; font-weight: normal; opacity: 0.85;">${dataSaved.tanggal}</span>`;
            }
          }

          // Hapus listener lama dengan membuat clone tombol
          const newBtn = btn.cloneNode(true);
          btn.parentNode.replaceChild(newBtn, btn);

          if (!isBendahara) {
            // Mode Siswa: Tombol aktif secara visual (bisa tampil centang), tetapi klik dikunci
            newBtn.disabled = false;
            newBtn.style.cursor = 'default';
            newBtn.onclick = (e) => {
              e.preventDefault();
            };
          } else {
            // Mode Bendahara: Tombol bisa diklik untuk ubah status di Firebase
            newBtn.disabled = false;
            newBtn.style.cursor = 'pointer';

            newBtn.onclick = () => {
              const statusLunasSekarang = !newBtn.classList.contains('lunas');
              const tglHariIni = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

              if (statusLunasSekarang) {
                database.ref('kas_kelas/' + keyStorage).set({
                  status: true,
                  tanggal: tglHariIni
                });
              } else {
                database.ref('kas_kelas/' + keyStorage).remove();
              }
            };
          }
        });
      });

      hitungRingkasan();
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      bulanIndex--;
      if (bulanIndex < 0) {
        bulanIndex = 11;
        tahunAktif--;
      }
      buatDataKas();
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      bulanIndex++;
      if (bulanIndex > 11) {
        bulanIndex = 0;
        tahunAktif++;
      }
      buatDataKas();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const keyword = e.target.value.toLowerCase();
      barisSiswa.forEach(baris => {
        const nama = baris.children[1] ? baris.children[1].textContent.toLowerCase() : '';
        baris.style.display = nama.includes(keyword) ? '' : 'none';
      });
    });
  }

  buatDataKas();
});
