document.addEventListener('DOMContentLoaded', () => {
    const isBendahara = localStorage.getItem('isBendahara') === 'true';
    const formContainer = document.getElementById('formContainer');
    const formBuatEvent = document.getElementById('formBuatEvent');
    const containerEvent = document.getElementById('containerEvent');

    // Elemen Modal Kustom Estetik
    const modal = document.getElementById('customModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const btnModalBatal = document.getElementById('btnModalBatal');
    const btnModalOk = document.getElementById('btnModalOk');
    
    let actionCallback = null;

    function bukaModalEstetik(judul, pesan, callback) {
        if (!modal) return;
        modalTitle.innerText = judul;
        modalMessage.innerText = pesan;
        actionCallback = callback;
        modal.classList.add('active');
    }

    if (btnModalBatal) {
        btnModalBatal.addEventListener('click', () => {
            modal.classList.remove('active');
            actionCallback = null;
        });
    }

    if (btnModalOk) {
        btnModalOk.addEventListener('click', () => {
            modal.classList.remove('active');
            if (typeof actionCallback === 'function') {
                actionCallback();
            }
            actionCallback = null;
        });
    }

    const daftarSiswa = [
        "Ahmad Faishal", "Airell Rahagi", "Aqila Zahra", "Arum Fitria", "Azka Dhiafin",
        "Bagus Adi", "Bevan Zacky", "Chantīka Putri", "Dea Anindya", "Devita Ayu",
        "Dewi Natasya", "Dimas Prasetia", "Fania Dinda", "Fardanu Maulana", "Hima Danara",
        "Intan Nurin", "Jeniva Aurora", "Jensina Natalia", "Kania Tanazza", "Khalisha Zidna",
        "Livia Mozza", "Mahawira Naocko", "M. Hasan", "M. Fikri", "Nico Maulidan",
        "Nur Azizah", "Ozzil Nayotama", "Pegy Pramitha", "Radingga Deega", "Sanjaya Ade",
        "Sanshita Pramesti", "Shafira Kirana", "Titah Amelia", "Yeisha Kristantyo", "Zahra Almaira", "Zaskia Jelita"
    ];

    if (formContainer) {
        formContainer.style.display = isBendahara ? 'block' : 'none';
    }

    let listEvent = JSON.parse(localStorage.getItem('data_event_urunan')) || [];

    function bersihkanNominal(val) {
        if (typeof val === 'number') return val;
        if (!val) return 0;
        return parseInt(val.toString().replace(/[^0-9]/g, ''), 10) || 0;
    }

    function renderEvent() {
        if (!containerEvent) return;

        containerEvent.innerHTML = '';

        if (listEvent.length === 0) {
            containerEvent.innerHTML = '<p style="text-align:center; color:rgba(255,255,255,0.4); font-size:12px; margin-top:20px;">Belum ada event urunan aktif.</p>';
            return;
        }

        listEvent.forEach((event, indexEvent) => {
            const dataCentang = JSON.parse(localStorage.getItem(`urunan_event_${event.id}`)) || {};
            const catatanEvent = localStorage.getItem(`catatan_event_${event.id}`) || '';
            
            let totalLunas = 0;
            Object.keys(dataCentang).forEach(key => {
                if (dataCentang[key] === true) totalLunas++;
            });
            const totalUangTerkumpul = totalLunas * event.nominal;

            const card = document.createElement('div');
            card.className = 'card-event';
            
            let htmlSiswa = '';
            daftarSiswa.forEach((nama, indexSiswa) => {
                const isLunas = dataCentang[indexSiswa] === true;
                htmlSiswa += `
                    <div class="item-siswa-urunan">
                        <span>${String(indexSiswa + 1).padStart(2, '0')}. ${nama}</span>
                        <button type="button" 
                                id="btn-siswa-${event.id}-${indexSiswa}"
                                class="btn-check-urunan ${isLunas ? 'lunas' : ''}" 
                                onclick="window.toggleUrunanSiswa(event, ${event.id}, ${indexSiswa}, ${event.nominal})" 
                                ${!isBendahara ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
                            ${isLunas ? '✓' : ''}
                        </button>
                    </div>
                `;
            });

            card.innerHTML = `
                <div class="event-header">
                    <div>
                        <div class="event-title">${event.nama}</div>
                        <div style="font-size: 11px; color: rgba(255,255,255,0.6);">
                            Target: Rp ${event.nominal.toLocaleString('id-ID')} / anak
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div class="event-sub" id="sub-anak-${event.id}">${totalLunas} / ${daftarSiswa.length} Anak</div>
                        <div style="font-size: 12px; font-weight: bold; color: #fff;" id="sub-uang-${event.id}">
                            Rp ${totalUangTerkumpul.toLocaleString('id-ID')}
                        </div>
                    </div>
                </div>

                ${isBendahara ? `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <button type="button" onclick="window.centangSemua(event, ${event.id})" style="background: #10b981; border: none; color: white; padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer;">
                            ✓ Centang Semua Siswa
                        </button>
                        <button type="button" onclick="window.batalCentangSemua(event, ${event.id})" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 6px 10px; border-radius: 6px; font-size: 11px; cursor: pointer;">
                            ✕ Hapus Semua Centang
                        </button>
                    </div>
                ` : ''}

                <div class="list-siswa-urunan">
                    ${htmlSiswa}
                </div>

                <!-- SEKSI CATATAN KETERANGAN -->
                <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <div style="font-size: 11px; color: rgba(255,255,255,0.7); margin-bottom: 5px;">📌 Keterangan Status:</div>
                    ${isBendahara ? `
                        <div style="display: flex; gap: 6px;">
                            <input type="text" id="input-catatan-${event.id}" value="${catatanEvent}" placeholder="Contoh: Uang sudah diserahkan ke Pak Guru" style="flex: 1; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: #fff; padding: 6px 10px; font-size: 11px;">
                            <button type="button" onclick="window.simpanCatatan(${event.id})" style="background: #3b82f6; border: none; color: white; padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer;">
                                Simpan
                            </button>
                        </div>
                    ` : `
                        <div style="font-size: 11px; color: #34d399; font-style: italic; background: rgba(255,255,255,0.05); padding: 8px; border-radius: 6px;">
                            ${catatanEvent ? catatanEvent : 'Belum ada keterangan.'}
                        </div>
                    `}
                </div>

                ${isBendahara ? `
                    <button type="button" onclick="window.hapusEvent(event, ${indexEvent})" style="background: transparent; border: none; color: #ff4d4d; font-size: 11px; margin-top: 12px; cursor: pointer;">
                        🗑 Hapus Event Ini
                    </button>
                ` : ''}
            `;

            containerEvent.appendChild(card);
        });
    }

    // FUNCTION SIMPAN CATATAN
    window.simpanCatatan = function(eventId) {
        const input = document.getElementById(`input-catatan-${eventId}`);
        if (input) {
            const teksCatatan = input.value.trim();
            localStorage.setItem(`catatan_event_${eventId}`, teksCatatan);
            bukaModalEstetik("Berhasil", "Keterangan catatan berhasil disimpan!", null);
        }
    };

    window.toggleUrunanSiswa = function(e, eventId, indexSiswa, nominal) {
        if (e) e.preventDefault();
        if (!isBendahara) return;

        const keyStorage = `urunan_event_${eventId}`;
        let dataCentang = JSON.parse(localStorage.getItem(keyStorage)) || {};
        
        const statusBaru = !dataCentang[indexSiswa];
        dataCentang[indexSiswa] = statusBaru;
        localStorage.setItem(keyStorage, JSON.stringify(dataCentang));

        const btn = document.getElementById(`btn-siswa-${eventId}-${indexSiswa}`);
        if (btn) {
            if (statusBaru) {
                btn.classList.add('lunas');
                btn.innerText = '✓';
            } else {
                btn.classList.remove('lunas');
                btn.innerText = '';
            }
        }

        let totalLunas = 0;
        Object.keys(dataCentang).forEach(key => {
            if (dataCentang[key] === true) totalLunas++;
        });
        const totalUangTerkumpul = totalLunas * nominal;

        const subAnak = document.getElementById(`sub-anak-${eventId}`);
        const subUang = document.getElementById(`sub-uang-${eventId}`);
        if (subAnak) subAnak.innerText = `${totalLunas} / ${daftarSiswa.length} Anak`;
        if (subUang) subUang.innerText = `Rp ${totalUangTerkumpul.toLocaleString('id-ID')}`;
    };

    window.centangSemua = function(e, eventId) {
        if (e) e.preventDefault();
        if (!isBendahara) return;

        bukaModalEstetik(
            "Centang Semua", 
            "Apakah kamu yakin ingin menandai semua siswa sebagai LUNAS di event ini?", 
            () => {
                const scrollPos = window.scrollY;
                const keyStorage = `urunan_event_${eventId}`;
                let dataCentang = {};
                
                daftarSiswa.forEach((_, idx) => {
                    dataCentang[idx] = true;
                });

                localStorage.setItem(keyStorage, JSON.stringify(dataCentang));
                renderEvent();
                setTimeout(() => window.scrollTo(0, scrollPos), 0);
            }
        );
    };

    window.batalCentangSemua = function(e, eventId) {
        if (e) e.preventDefault();
        if (!isBendahara) return;

        bukaModalEstetik(
            "Reset Urunan", 
            "Apakah kamu yakin ingin mengosongkan kembali semua centang siswa di event ini?", 
            () => {
                const scrollPos = window.scrollY;
                const keyStorage = `urunan_event_${eventId}`;
                localStorage.removeItem(keyStorage);
                renderEvent();
                setTimeout(() => window.scrollTo(0, scrollPos), 0);
            }
        );
    };

    window.hapusEvent = function(e, index) {
        if (e) e.preventDefault();
        if (!isBendahara) return;

        bukaModalEstetik(
            "Hapus Event", 
            "Event urunan ini akan dihapus permanen. Lanjutkan?", 
            () => {
                const scrollPos = window.scrollY;
                const eventId = listEvent[index].id;
                localStorage.removeItem(`urunan_event_${eventId}`);
                localStorage.removeItem(`catatan_event_${eventId}`);
                listEvent.splice(index, 1);
                localStorage.setItem('data_event_urunan', JSON.stringify(listEvent));
                renderEvent();
                setTimeout(() => window.scrollTo(0, scrollPos), 0);
            }
        );
    };

    if (formBuatEvent) {
        formBuatEvent.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!isBendahara) return;

            const nama = document.getElementById('namaEvent').value.trim();
            const nominalInput = document.getElementById('targetNominal').value;
            const nominal = bersihkanNominal(nominalInput);

            if (!nama || nominal <= 0) return;

            const newEvent = {
                id: Date.now(),
                nama: nama,
                nominal: nominal
            };

            listEvent.unshift(newEvent);
            localStorage.setItem('data_event_urunan', JSON.stringify(listEvent));

            formBuatEvent.reset();
            renderEvent();
        });
    }

    const inputNominal = document.getElementById('targetNominal');
    if (inputNominal) {
        inputNominal.addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^0-9]/g, '');
            e.target.value = value ? parseInt(value, 10).toLocaleString('id-ID') : '';
        });
    }

    renderEvent();
});
