// StarGrow Boost Application Logic & State
const CONFIG = {
    MAIN_PROVIDER_URL: 'https://shweboost.com/api/v2',
    MAIN_PROVIDER_KEY: 'dbb7a85b0635f5dca25e4118a8a4bbd6'
};

// Initial Services List (Organized by Categories & Service IDs)
let servicesData = [
    { 
        id: 485, 
        platform: "Telegram", 
        category: "Telegram premium Members", 
        name: "🔥Telegram Premium Members -- 🔥ရက်30 Members", 
        price: 45699, 
        avg: "0-24 hours", 
        min: 1000, 
        max: 30000, 
        notes: "🔗 Link : Channel/Group Link\n⚡️အာမခံချက် : ရက်၃၀ အာမခံ", 
        active: true 
    },
    { 
        id: 2060, 
        platform: "Telegram", 
        category: "Telegram Group/Channel Member", 
        name: "Telegram Group/Channel Member | ရက်၃၀ပြန်မကျ✅", 
        price: 2060, 
        avg: "1-2 hours", 
        min: 100, 
        max: 100000, 
        notes: "Quality ရှယ် | ဝယ်သင့်", 
        active: true 
    },
    { 
        id: 3200, 
        platform: "Telegram", 
        category: "Telegram Group/Channel Member", 
        name: "Telegram Group/Channel Member | ရက်၉၀ပြန်မကျ✅", 
        price: 3200, 
        avg: "1-2 hours", 
        min: 100, 
        max: 100000, 
        notes: "Quality ရှယ်", 
        active: true 
    },
    { 
        id: 6450, 
        platform: "Telegram", 
        category: "Telegram Group/Channel Member", 
        name: "Telegram Group/Channel Member | တစ်သက်စာပြန်မကျ✅", 
        price: 6450, 
        avg: "1-2 hours", 
        min: 100, 
        max: 100000, 
        notes: "Lifetime Guaranteed", 
        active: true 
    },
    { 
        id: 280, 
        platform: "Telegram", 
        category: "Telegram Reaction", 
        name: "Telegram Reaction [❤️💋🥰]✅", 
        price: 280, 
        avg: "48 mins", 
        min: 100, 
        max: 100000, 
        notes: "V3 Note - Quality ရှယ်", 
        active: true 
    },
    { 
        id: 2000, 
        platform: "TikTok", 
        category: "TikTok Likes", 
        name: "TikTok Like [🚀Super Fast Speed] ပြန်မကျ 30Day", 
        price: 2000, 
        avg: "Instant", 
        min: 100, 
        max: 1000000, 
        notes: "Super Fast Speed", 
        active: true 
    }
];

let currentUser = null;
let isAdminLoggedIn = false;
let userOrders = [];
let userPayments = [];
let userBalance = 50000; // Starting test balance

// --- TAB SWITCHER ---
function switchTab(tabId) {
    document.querySelectorAll('.page-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    const page = document.getElementById(tabId);
    if(page) page.classList.add('active');

    if(tabId === 'u-order') {
        filterServicesByCategory();
    }
    if(tabId === 'a-services') renderAdminServices();
    if(tabId === 'u-history') renderUserOrders();
    if(tabId === 'a-orders') renderAdminOrders();
    if(tabId === 'a-payments') renderAdminPayments();
}

// --- CATEGORY & SERVICE SELECTOR ENGINE ---
function filterServicesByCategory() {
    const selectedCat = document.getElementById('category-select').value;
    const selectElem = document.getElementById('service-select');
    
    const filtered = servicesData.filter(s => {
        if(!s.active) return false;
        if(selectedCat === 'All') return true;
        return s.platform === selectedCat;
    });

    selectElem.innerHTML = filtered.map(s => 
        `<option value="${s.id}">#${s.id} - ${s.name} - ${s.price} Ks/1k</option>`
    ).join('');

    calculatePrice();
}

function calculatePrice() {
    const serviceId = parseInt(document.getElementById('service-select').value);
    const qty = parseInt(document.getElementById('order-quantity').value) || 0;
    const service = servicesData.find(s => s.id === serviceId);
    const infoBox = document.getElementById('service-info-badge');

    if (service) {
        const total = (qty / 1000) * service.price;
        document.getElementById('order-total-price').value = `${total.toFixed(0)} Ks`;

        // Highlight Service ID clearly with yellow badge
        infoBox.innerHTML = `
            <div><b>Service ID:</b> <span class="service-id-badge">#${service.id}</span></div>
            <div><b>Category:</b> ${service.category}</div>
            <div><b>Min / Max:</b> ${service.min} - ${service.max}</div>
            <div><b>Avg Time:</b> ${service.avg}</div>
            <div style="margin-top:5px; color:#9ca3af;">${service.notes.replace(/\n/g, '<br>')}</div>
        `;
    } else {
        infoBox.innerHTML = 'ဝန်ဆောင်မှု မရှိပါ';
    }
}

// --- ORDER SUBMISSION & AUTO ORDER FORWARDING ---
async function handlePlaceOrder(e) {
    e.preventDefault();
    const serviceId = parseInt(document.getElementById('service-select').value);
    const link = document.getElementById('order-link').value;
    const qty = parseInt(document.getElementById('order-quantity').value);
    const service = servicesData.find(s => s.id === serviceId);

    const cost = (qty / 1000) * service.price;

    if (userBalance < cost) {
        alert("လက်ကျန်ငွေ မလုံလောက်ပါ။ ငွေကြိုတင်ဖြည့်သွင်းပါ။");
        return;
    }

    userBalance -= cost;

    // Send Auto Order to Main Provider
    const autoResult = await sendAutoOrderAPI(service.id, link, qty);

    const orderObj = {
        id: userOrders.length + 1,
        serviceId: service.id,
        serviceName: service.name,
        link: link,
        qty: qty,
        price: cost,
        providerOrderId: autoResult.order || 'Auto-Failed',
        status: autoResult.status === 'success' ? 'Processing (Auto)' : 'Pending'
    };

    userOrders.push(orderObj);
    alert(`အော်ဒါအောင်မြင်ပါသည်! Auto Order ID: #${orderObj.providerOrderId}`);
    switchTab('u-history');
}

async function sendAutoOrderAPI(serviceId, link, quantity) {
    // SMM Panel API v2 Call Simulation
    console.log(`Auto forwarding to https://shweboost.com/api/v2 -> Service ID: ${serviceId}`);
    return { status: "success", order: Math.floor(100000 + Math.random() * 800000) };
}

function renderUserOrders() {
    const tbody = document.getElementById('user-order-table-body');
    tbody.innerHTML = userOrders.map(o => `
        <tr>
            <td>#${o.id}</td>
            <td><span class="service-id-badge">#${o.serviceId}</span></td>
            <td>${o.serviceName}</td>
            <td>${o.link}</td>
            <td>${o.qty}</td>
            <td>${o.price} Ks</td>
            <td><span class="badge badge-success">${o.status}</span></td>
        </tr>
    `).join('');
}

function handleTopUp(e) {
    e.preventDefault();
    const txid = document.getElementById('topup-txid').value;
    const amount = document.getElementById('topup-amount').value;
    const method = document.getElementById('topup-method').value;

    userPayments.push({ id: txid, method, amount, status: 'Pending' });
    alert("ငွေဖြည့်သွင်းမှု တောင်းဆိုပြီးပါပြီ။ Admin မှ စစ်ဆေးပေးပါမည်။");
    document.getElementById('admin-pending-payments').innerText = userPayments.length;
}

// --- ADMIN MODAL & SERVICES MANAGEMENT (IMAGE MATCHING) ---
function openAddServiceModal() {
    document.getElementById('modal-title').innerText = "Add New Service";
    document.getElementById('edit-service-index').value = "-1";
    document.getElementById('modal-name').value = "";
    document.getElementById('modal-service-id').value = "";
    document.getElementById('modal-category').value = "";
    document.getElementById('modal-price').value = "";
    document.getElementById('modal-min').value = "1000";
    document.getElementById('modal-max').value = "100000";
    document.getElementById('modal-notes').value = "";
    document.getElementById('modal-active').checked = true;

    document.getElementById('service-modal').style.display = 'flex';
}

function openEditServiceModal(index) {
    const s = servicesData[index];
    document.getElementById('modal-title').innerText = "Edit service";
    document.getElementById('edit-service-index').value = index;
    document.getElementById('modal-name').value = s.name;
    document.getElementById('modal-service-id').value = s.id;
    document.getElementById('modal-platform').value = s.platform || "Telegram";
    document.getElementById('modal-category').value = s.category;
    document.getElementById('modal-price').value = s.price;
    document.getElementById('modal-avg').value = s.avg || "0-24 hours";
    document.getElementById('modal-min').value = s.min;
    document.getElementById('modal-max').value = s.max;
    document.getElementById('modal-notes').value = s.notes;
    document.getElementById('modal-active').checked = s.active;

    document.getElementById('service-modal').style.display = 'flex';
}

function closeServiceModal() {
    document.getElementById('service-modal').style.display = 'none';
}

function handleSaveService(e) {
    e.preventDefault();
    const idx = parseInt(document.getElementById('edit-service-index').value);

    const serviceObj = {
        id: parseInt(document.getElementById('modal-service-id').value),
        platform: document.getElementById('modal-platform').value,
        category: document.getElementById('modal-category').value,
        name: document.getElementById('modal-name').value,
        price: parseFloat(document.getElementById('modal-price').value),
        avg: document.getElementById('modal-avg').value,
        min: parseInt(document.getElementById('modal-min').value),
        max: parseInt(document.getElementById('modal-max').value),
        notes: document.getElementById('modal-notes').value,
        active: document.getElementById('modal-active').checked
    };

    if (idx === -1) {
        servicesData.push(serviceObj);
    } else {
        servicesData[idx] = serviceObj;
    }

    closeServiceModal();
    renderAdminServices();
    alert("ဝန်ဆောင်မှု အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ။");
}

function renderAdminServices() {
    const tbody = document.getElementById('admin-services-table');
    tbody.innerHTML = servicesData.map((s, idx) => `
        <tr>
            <td><span class="service-id-badge">#${s.id}</span></td>
            <td>${s.platform}</td>
            <td>${s.category}</td>
            <td>${s.name}</td>
            <td>${s.price} Ks</td>
            <td>${s.min} - ${s.max}</td>
            <td>${s.active ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-pending">Disabled</span>'}</td>
            <td>
                <button class="btn btn-sm" onclick="openEditServiceModal(${idx})">Edit</button>
            </td>
        </tr>
    `).join('');
}

function renderAdminOrders() {
    document.getElementById('admin-order-count').innerText = userOrders.length;
    const tbody = document.getElementById('admin-orders-table');
    tbody.innerHTML = userOrders.map(o => `
        <tr>
            <td>#${o.id}</td>
            <td>${o.link}</td>
            <td><span class="service-id-badge">#${o.serviceId}</span></td>
            <td>${o.qty}</td>
            <td>#${o.providerOrderId}</td>
            <td><span class="badge badge-success">Auto Sent</span></td>
        </tr>
    `).join('');
}

function renderAdminPayments() {
    const tbody = document.getElementById('admin-payments-table');
    tbody.innerHTML = userPayments.map((p, idx) => `
        <tr>
            <td>${p.id}</td>
            <td>${p.method}</td>
            <td>${p.amount} Ks</td>
            <td><span class="badge badge-pending">${p.status}</span></td>
            <td><button class="btn btn-sm" onclick="approvePayment(${idx})">Approve</button></td>
        </tr>
    `).join('');
}

function approvePayment(idx) {
    userPayments[idx].status = 'Approved';
    userBalance += parseFloat(userPayments[idx].amount);
    alert("ငွေဖြည့်သွင်းမှု အတည်ပြုပြီးပါပြီ။");
    renderAdminPayments();
}

// --- AUTHENTICATION MODALS ---
function openAuthModal(type) {
    const modal = document.getElementById('auth-modal');
    const userBox = document.getElementById('user-auth-box');
    const adminBox = document.getElementById('admin-auth-box');

    if(type === 'user') {
        document.getElementById('auth-modal-title').innerText = "User Authentication";
        userBox.style.display = 'block';
        adminBox.style.display = 'none';
    } else {
        document.getElementById('auth-modal-title').innerText = "Admin Portal Login";
        userBox.style.display = 'none';
        adminBox.style.display = 'block';
    }
    modal.style.display = 'flex';
}

function closeAuthModal() {
    document.getElementById('auth-modal').style.display = 'none';
}

function switchAuthTab(type) {
    const loginForm = document.getElementById('user-login-form');
    const regForm = document.getElementById('user-register-form');
    const tabLogin = document.getElementById('tab-login');
    const tabReg = document.getElementById('tab-register');

    if(type === 'login') {
        loginForm.style.display = 'block';
        regForm.style.display = 'none';
        tabLogin.classList.add('active');
        tabReg.classList.remove('active');
    } else {
        loginForm.style.display = 'none';
        regForm.style.display = 'block';
        tabLogin.classList.remove('active');
        tabReg.classList.add('active');
    }
}

function handleUserLogin(e) {
    e.preventDefault();
    const id = document.getElementById('user-login-id').value;
    currentUser = id;
    document.getElementById('user-auth-btn').innerText = `👤 ${id}`;
    closeAuthModal();
    alert(`ကြိုဆိုပါတယ် ${id}! Login အောင်မြင်ပါသည်။`);
}

function handleUserRegister(e) {
    e.preventDefault();
    const user = document.getElementById('reg-user').value;
    currentUser = user;
    document.getElementById('user-auth-btn').innerText = `👤 ${user}`;
    closeAuthModal();
    alert("အကောင့်သစ် ဖွင့်လှစ်ခြင်း အောင်မြင်ပါသည်။");
}

function handleAdminLogin(e) {
    e.preventDefault();
    const user = document.getElementById('admin-user').value;
    const pass = document.getElementById('admin-pass').value;
    const pin = document.getElementById('admin-pin').value;

    if (user === "Admin" && pass === "htetmyatoo2580" && pin === "htetmyatoo2012") {
        isAdminLoggedIn = true;
        document.getElementById('admin-login-btn').innerText = "🔓 Admin Active";
        closeAuthModal();
        alert("Admin Dashboard သို့ အောင်မြင်စွာ ဝင်ရောက်ပြီးပါပြီ။");
        switchTab('a-dashboard');
    } else {
        alert("Username/Password သို့မဟုတ် Pin မှားယွင်းနေပါသည်။");
    }
}

// Global Initialization
document.addEventListener('DOMContentLoaded', () => {
    filterServicesByCategory();
});
  
