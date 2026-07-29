// System State & Services
let balance = 15000;
let nextOrderId = 1001;
let loggedUser = null;

// Default Services List
let servicesList = [
    { id: "2060", name: "Telegram Group/Channel Member | ရက်၃၀ပြန်မကျ", price: 2060 },
    { id: "3200", name: "Telegram Group/Channel Member | ရက်၉၀ပြန်မကျ", price: 3200 },
    { id: "6450", name: "Telegram Group/Channel Member | တစ်သက်စာ", price: 6450 },
    { id: "280",  name: "Telegram Reaction [❤️💋🥰]", price: 280 },
    { id: "2000", name: "Tiktok Like [Super Fast Speed] 30Day", price: 2000 },
    { id: "2500", name: "Tiktok Like [Super Fast Speed] Lifetime", price: 2500 }
];

// Owner Credentials
const OWNER = {
    email: "htetmyato709@gmail.com",
    pass: "htetmyatoo2580",
    dashPass: "htetmyatoo2012"
};

// Initialize App
window.onload = function() {
    renderServices();
};

// Navigation Control
function switchNav(tabId, el) {
    document.querySelectorAll('.tab-pane').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');

    if (el) {
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        el.classList.add('active');
    }
}

// Render Services in User Select & Admin Table
function renderServices() {
    const selectEl = document.getElementById('service-select');
    const adminTableEl = document.getElementById('admin-service-list');
    
    selectEl.innerHTML = '<option value="">-- ဝန်ဆောင်မှု ရွေးချယ်ပါ --</option>';
    adminTableEl.innerHTML = '';

    servicesList.forEach(s => {
        // Option Display with Service ID
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.dataset.price = s.price;
        opt.dataset.id = s.id;
        opt.innerText = `[ID: ${s.id}] ${s.name} - ${s.price} Ks`;
        selectEl.appendChild(opt);

        // Admin Table Row
        adminTableEl.innerHTML += `
            <tr style="border-bottom:1px solid #eee;">
                <td style="padding:8px;"><span class="service-id-badge">ID: ${s.id}</span></td>
                <td>${s.name}</td>
                <td>${s.price} Ks</td>
            </tr>
        `;
    });
}

// Highlight Selected Service ID
function onServiceSelectChange() {
    const select = document.getElementById('service-select');
    const selectedOpt = select.options[select.selectedIndex];
    const displayBox = document.getElementById('service-id-display');
    const idBadge = document.getElementById('highlighted-service-id');

    if (select.value) {
        const serviceId = selectedOpt.dataset.id;
        idBadge.innerText = `ID: #${serviceId}`;
        displayBox.style.display = 'flex';
    } else {
        displayBox.style.display = 'none';
    }
    calculatePrice();
}

function calculatePrice() {
    const select = document.getElementById('service-select');
    const price = parseFloat(select.options[select.selectedIndex]?.dataset.price || 0);
    const qty = parseInt(document.getElementById('order-qty').value || 0);
    const total = Math.ceil((price / 1000) * qty);
    document.getElementById('order-cost').value = total + ' Ks';
}

// Submit Order
async function handleOrderSubmit(e) {
    e.preventDefault();
    const select = document.getElementById('service-select');
    const selectedOpt = select.options[select.selectedIndex];
    
    if (!select.value) {
        alert("ဝန်ဆောင်မှု ရွေးချယ်ပါ");
        return;
    }

    const serviceId = selectedOpt.dataset.id;
    const serviceName = selectedOpt.text;
    const link = document.getElementById('order-link').value;
    const qty = document.getElementById('order-qty').value;
    const cost = parseInt(document.getElementById('order-cost').value);

    if (balance < cost) {
        alert("လက်ကျန်ငွေ မလုံလောက်ပါ။ ငွေဖြည့်ပါ။");
        return;
    }

    // Auto Order to Main Provider API v2
    try {
        await fetch('https://shweboost.com/api/v2', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                key: 'dbb7a85b0635f5dca25e4118a8a4bbd6',
                action: 'add',
                service: serviceId,
                link: link,
                quantity: qty
            })
        });
    } catch (err) { console.log("API Triggered"); }

    balance -= cost;
    document.getElementById('user-bal').innerText = balance.toLocaleString();

    const currentIdStr = '#' + nextOrderId++;

    // Receipt Display
    document.getElementById('rec-id').innerText = currentIdStr;
    document.getElementById('rec-sid').innerText = `ID: ${serviceId}`;
    document.getElementById('rec-service').innerText = serviceName;
    document.getElementById('rec-qty').innerText = qty;
    document.getElementById('rec-link').innerText = link;
    document.getElementById('rec-cost').innerText = cost + ' Ks';
    document.getElementById('rec-bal').innerText = balance.toLocaleString() + ' Ks';
    document.getElementById('modal-receipt').style.display = 'flex';

    // Order History Update
    const historyBody = document.getElementById('history-rows');
    historyBody.innerHTML += `
        <tr style="border-bottom:1px solid #eee;">
            <td style="padding:6px;">${currentIdStr}</td>
            <td><span class="service-id-badge" style="font-size:10px;">ID: ${serviceId}</span></td>
            <td>${qty}</td>
            <td>${cost} Ks</td>
        </tr>
    `;
}

// Auth Forms Toggle
function toggleAuthForm(type) {
    if (type === 'login') {
        document.getElementById('form-login').style.display = 'block';
        document.getElementById('form-signup').style.display = 'none';
        document.getElementById('btn-tab-login').classList.add('active');
        document.getElementById('btn-tab-signup').classList.remove('active');
    } else {
        document.getElementById('form-login').style.display = 'none';
        document.getElementById('form-signup').style.display = 'block';
        document.getElementById('btn-tab-signup').classList.add('active');
        document.getElementById('btn-tab-login').classList.remove('active');
    }
}

// Authentication Handlers
function handleAuthLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-pass').value;
    loginUserProcess(email, pass);
}

function handleAuthSignUp(e) {
    e.preventDefault();
    const email = document.getElementById('signup-email').value.trim();
    const pass = document.getElementById('signup-pass').value;
    loginUserProcess(email, pass);
}

function loginUserProcess(email, pass) {
    loggedUser = email;
    document.getElementById('auth-box').style.display = 'none';
    document.getElementById('user-profile-box').style.display = 'block';
    document.getElementById('active-email').innerText = email;

    if (email === OWNER.email && pass === OWNER.pass) {
        document.getElementById('btn-admin-panel-access').style.display = 'block';
        openAdminPasswordModal();
    } else {
        alert("Login အောင်မြင်ပါသည်။");
        document.getElementById('btn-admin-panel-access').style.display = 'none';
    }
}

function openAdminPasswordModal() {
    document.getElementById('modal-admin-pass').style.display = 'flex';
}

function closeAdminModal() {
    document.getElementById('modal-admin-pass').style.display = 'none';
}

function verifyAdminDashboardPass(e) {
    e.preventDefault();
    const dashPass = document.getElementById('admin-dash-input').value;

    if (dashPass === OWNER.dashPass) {
        alert("✅ Owner Verification အောင်မြင်ပါသည်။ Admin Dashboard သို့ ဝင်ရောက်ပါပြီ။");
        closeAdminModal();
        switchNav('a-dashboard');
    } else {
        alert("❌ Admin Dashboard Password မှားယွင်းနေပါသည်။");
    }
}

function handleLogout() {
    loggedUser = null;
    document.getElementById('auth-box').style.display = 'block';
    document.getElementById('user-profile-box').style.display = 'none';
    document.getElementById('form-login').reset();
    document.getElementById('form-signup').reset();
    switchNav('u-home');
}

// Admin: Add New Service
function handleAddService(e) {
    e.preventDefault();
    const name = document.getElementById('new-service-name').value.trim();
    const id = document.getElementById('new-service-id').value.trim();
    const price = parseFloat(document.getElementById('new-service-price').value);

    servicesList.push({ id: id, name: name, price: price });
    renderServices();

    alert(`✅ Service ID: #${id} ကို အောင်မြင်စွာ ထည့်သွင်းပြီးပါပြီ။`);
    document.getElementById('new-service-name').value = '';
    document.getElementById('new-service-id').value = '';
    document.getElementById('new-service-price').value = '';
}

function closeReceiptModal() {
    document.getElementById('modal-receipt').style.display = 'none';
}

function handleTopupSubmit(e) {
    e.preventDefault();
    alert("TopUp တောင်းဆိုမှု ရောက်ရှိပါသည်။ Admin မှ အတည်ပြုပေးပါမည်။");
                      }
  
