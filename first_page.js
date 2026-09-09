document.addEventListener('DOMContentLoaded', () => {
    const btnPemasukan = document.querySelector('.opsi a[href="pengeluaran.html"]');
    const btnLogin = document.querySelector('.opsi button');

    const modalPin = document.getElementById('modalPin');
    const inputPin = document.getElementById('inputPin');
    const pesanErrorPin = document.getElementById('pesanErrorPin');
    const btnBatalModal = document.getElementById('btnBatalModal');
    const btnMasukModal = document.getElementById('btnMasukModal');

    const modalLogout = document.getElementById('modalLogout');
    const btnBatalLogout = document.getElementById('btnBatalLogout');
    const btnYaLogout = document.getElementById('btnYaLogout');

    if (localStorage.getItem('isBendahara') === 'true') {
        if (btnLogin) btnLogin.innerHTML = 'Mode Bendahara (Logout)';
    }

    if (btnLogin) {
        btnLogin.addEventListener('click', () => {
            if (localStorage.getItem('isBendahara') === 'true') {
                modalLogout.classList.add('active');
            } else {
                modalPin.classList.add('active');
                if (inputPin) inputPin.focus();
            }
        });
    }

    const tutupModalPin = () => {
        if (modalPin) modalPin.classList.remove('active');
        if (inputPin) inputPin.value = '';
        if (pesanErrorPin) pesanErrorPin.style.display = 'none';
    };

    if (btnBatalModal) {
        btnBatalModal.addEventListener('click', tutupModalPin);
    }

    const eksekusiLogin = () => {
        if (inputPin && inputPin.value === '100310') {
            localStorage.setItem('isBendahara', 'true');
            tutupModalPin();
            window.location.href = 'kasbulan.html';
        } else {
            if (pesanErrorPin) pesanErrorPin.style.display = 'block';
            if (inputPin) {
                inputPin.value = '';
                inputPin.focus();
            }
        }
    };

    if (btnMasukModal) {
        btnMasukModal.addEventListener('click', eksekusiLogin);
    }

    if (inputPin) {
        inputPin.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') eksekusiLogin();
        });
    }

    if (btnBatalLogout) {
        btnBatalLogout.addEventListener('click', () => {
            if (modalLogout) modalLogout.classList.remove('active');
        });
    }

    if (btnYaLogout) {
        btnYaLogout.addEventListener('click', () => {
            localStorage.removeItem('isBendahara');
            if (modalLogout) modalLogout.classList.remove('active');
            if (btnLogin) btnLogin.innerHTML = 'Login as Bendahara';
        });
    }
});
