document.addEventListener('DOMContentLoaded', () => {
    const isBendahara = localStorage.getItem('isBendahara') === 'true';
    const formContainer = document.getElementById('formContainer');
    const formTransaksi = document.getElementById('formTransaksi');
    const daftarTransaksiEl = document.getElementById('daftarTransaksi');
    const statSisaSaldoEl = document.getElementById('statSisaSaldo');
    const inputTanggal = document.getElementById('tanggalTransaksi');

    const modalHapus = document.getElementById('modalHapus');
    const btnBatalHapus = document.getElementById('btnBatalHapus');
    const btnKonfirmasiHapus = document.getElementById('btnKonfirmasiHapus');
    let indexAkanDihapus = null;
    const NOMINAL_PER_CENTANG = 5000;
  
    if (inputTanggal) {
        const today = new Date().toISOString().split('T')[0];
        inputTanggal.value = today;
    }

    if (isBendahara && formContainer) {
        formContainer.style.display = 'block';
    }

    let dataKeuangan = JSON.parse(localStorage.getItem('data_keuangan_kas')) || [];

    function bersihkanNominal(val) {
        if (typeof val === 'number') return val;
        if (!val) return 0;
        const cleaned = val.toString().replace(/[^0-9]/g, '');
        return parseInt(cleaned, 10) || 0;
    }

    function hitungTotalKasSiswa() {
        let totalUangSiswa = 0;
        const bulanAktif = "September";
        const tahunAktif = "2026";

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('kas_') && key.includes(bulanAktif) && key.includes(tahunAktif)) {
                const val = localStorage.getItem(key);
                if (val === 'true' || val === true) {
                    totalUangSiswa += NOMINAL_PER_CENTANG;
                }
            }
        }
        return totalUangSiswa;
    }

    function renderKeuangan() {
        daftarTransaksiEl.innerHTML = '';
        
        let totalSaldo = hitungTotalKasSiswa();

        if (dataKeuangan.length === 0) {
            daftarTransaksiEl.innerHTML = '<p style="text-align:center; color:rgba(255,255,255,0.4); font-size:12px; margin-top:20px;">Belum ada riwayat transaksi manual</p>';
        }

        dataKeuangan.forEach((item, index) => {
            const nominal = bersihkanNominal(item.nominal);

            if (item.tipe === 'pemasukan') {
                totalSaldo += nominal;
            } else {
                totalSaldo -= nominal;
            }

            const itemEl = document.createElement('div');
            itemEl.className = 'item-transaksi';
            itemEl.innerHTML = `
                <div class="item-info">
                    <span class="ket">${item.keterangan}</span>
                    <span class="tgl">${item.tanggal}</span>
                </div>
                <div style="display:flex; align-items:center;">
                    <span class="nominal ${item.tipe}">
                        ${item.tipe === 'pemasukan' ? '+' : '-'} Rp ${nominal.toLocaleString('id-ID')}
                    </span>
                    ${isBendahara ? `<button class="btn-hapus" onclick="bukaModalHapus(${index})">✕</button>` : ''}
                </div>
            `;
            daftarTransaksiEl.appendChild(itemEl);
        });

        if (statSisaSaldoEl) {
            statSisaSaldoEl.textContent = `Rp ${totalSaldo.toLocaleString('id-ID')}`;
        }
    }

    if (formTransaksi) {
        formTransaksi.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const tipeEl = document.querySelector('input[name="tipeTransaksi"]:checked');
            const tipe = tipeEl ? tipeEl.value : 'pemasukan';
            const keterangan = document.getElementById('keterangan').value.trim();
            const nominalInput = document.getElementById('nominal').value;
            const tglVal = inputTanggal ? inputTanggal.value : '';
            
            const nominalFix = bersihkanNominal(nominalInput);

            if (nominalFix <= 0) {
                alert('Masukkan nominal yang valid!');
                return;
            }
            let tglFormatted = '';
            if (tglVal) {
                const dateObj = new Date(tglVal);
                tglFormatted = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
            } else {
                tglFormatted = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
            }

            dataKeuangan.unshift({ tipe, keterangan, nominal: nominalFix, tanggal: tglFormatted });
            localStorage.setItem('data_keuangan_kas', JSON.stringify(dataKeuangan));

            formTransaksi.reset();
            
            if (inputTanggal) {
                inputTanggal.value = new Date().toISOString().split('T')[0];
            }

            const tipePemasukanEl = document.getElementById('tipePemasukan');
            if (tipePemasukanEl) tipePemasukanEl.checked = true;

            renderKeuangan();
        });
    }

    window.bukaModalHapus = function(index) {
        indexAkanDihapus = index;
        if (modalHapus) modalHapus.style.display = 'flex';
    };

    if (btnBatalHapus) {
        btnBatalHapus.addEventListener('click', () => {
            if (modalHapus) modalHapus.style.display = 'none';
            indexAkanDihapus = null;
        });
    }

    if (btnKonfirmasiHapus) {
        btnKonfirmasiHapus.addEventListener('click', () => {
            if (indexAkanDihapus !== null) {
                dataKeuangan.splice(indexAkanDihapus, 1);
                localStorage.setItem('data_keuangan_kas', JSON.stringify(dataKeuangan));
                renderKeuangan();
                if (modalHapus) modalHapus.style.display = 'none';
                indexAkanDihapus = null;
            }
        });
    }

    renderKeuangan();
});


const inputNominal = document.getElementById('nominal');
if (inputNominal) {
    inputNominal.addEventListener('input', (e) => {
        let value = e.target.value.replace(/[^0-9]/g, '');
        if (value) {
            e.target.value = parseInt(value, 10).toLocaleString('id-ID');
        } else {
            e.target.value = '';
        }
    });
}
