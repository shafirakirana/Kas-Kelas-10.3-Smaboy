document.addEventListener('DOMContentLoaded', () => {
    const isBendahara = localStorage.getItem('isBendahara') === 'true';
    const barisSiswa = document.querySelectorAll('.baris:not(.header)');
    const searchInput = document.getElementById('searchInput');
    
    const NOMINAL_PER_MINGGU = 5000; 

    const labelBulan = document.getElementById('labelBulan');
    const btnPrev = document.getElementById('btnBulanPrev');
    const btnNext = document.getElementById('btnBulanNext');

    const daftarBulan = [
        "JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI",
        "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"
    ];
    
    let bulanIndex = 8; 
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

    function muatDataKas() {
        const namaBulanAktif = daftarBulan[bulanIndex];
        if (labelBulan) {
            labelBulan.textContent = `${namaBulanAktif} ${tahunAktif}`;
        }

        barisSiswa.forEach((baris, indexSiswa) => {
            const buttons = baris.querySelectorAll('button');

            buttons.forEach((btn, indexMinggu) => {
                const keyStorage = `kas_${tahunAktif}_${namaBulanAktif}_siswa_${indexSiswa}_minggu_${indexMinggu}`;
                const keyTanggal = `${keyStorage}_tgl`;
                btn.classList.remove('lunas');
                btn.innerHTML = '';

                if (localStorage.getItem(keyStorage) === 'true') {
                    btn.classList.add('lunas');
                    const tglSaved = localStorage.getItem(keyTanggal) || '✓';
                    btn.innerHTML = `✓<br><span style="font-size: 8px; font-weight: normal; opacity: 0.85;">${tglSaved}</span>`;
                }

                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);

                if (!isBendahara) {
                    newBtn.disabled = true;
                    newBtn.style.cursor = 'not-allowed';
                    newBtn.style.opacity = '0.7';
                } else {
                    newBtn.disabled = false;
                    newBtn.style.cursor = 'pointer';
                    
                    newBtn.addEventListener('click', () => {
                        newBtn.classList.toggle('lunas');
                        const statusLunas = newBtn.classList.contains('lunas');
                        localStorage.setItem(keyStorage, statusLunas);
                        
 if (statusLunas) {
         const tglHariIni = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                            localStorage.setItem(keyTanggal, tglHariIni);
                            newBtn.innerHTML = `✓<br><span style="font-size: 8px; font-weight: normal; opacity: 0.85;">${tglHariIni}</span>`;
                        } else {
                          
                            localStorage.removeItem(keyTanggal);
                            newBtn.innerHTML = '';
                        }
                        
                        hitungRingkasan();
                    });
                }
            });
        });

        hitungRingkasan();
    }

    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            bulanIndex--;
            if (bulanIndex < 0) {
                bulanIndex = 11;
                tahunAktif--;
            }
            muatDataKas();
        });
    }

    if (btnNext) {
        btnNext.addEventListener('click', () => {
            bulanIndex++;
            if (bulanIndex > 11) {
                bulanIndex = 0;
                tahunAktif++;
            }
            muatDataKas();
        });
    }
  
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const kataKunci = e.target.value.toLowerCase().trim();
            barisSiswa.forEach(baris => {
                const nama = baris.querySelector('span:nth-child(2)').textContent.toLowerCase();
                baris.style.display = nama.includes(kataKunci) ? 'grid' : 'none';
            });
        });
    }

    muatDataKas();const tglHariIni = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
newBtn.innerHTML = `
    <span class="icon-centang">✓</span>
    <span class="badge-tgl">${tglHariIni}</span>
`;
});
