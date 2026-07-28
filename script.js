// --- 1. CONFIGURATION & SYSTEM STATE ---
const CONFIG = {
    MAIN_PROVIDER_URL: 'https://shweboost.com/api/v2',
    MAIN_PROVIDER_KEY: 'dbb7a85b0635f5dca25e4118a8a4bbd6',
    SUPABASE_URL: 'https://jhcnqwzezvjldhigxpze.supabase.co',
    SUPABASE_ANON: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoY25xd3plenZqbGRoaWd4cHplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NDQ0ODUsImV4cCI6MjEwMDUyMDQ4NX0.pwq1ps7MfvQIiZGuvs9TLimYRSq_9O5ebaMrKqd6oZk'
};

// Initial Services List Data
let servicesData = [
    { id: 1, name: "Telegram Group/Channel Member | ရက်၃၀ပြန်မကျ✅", providerId: 2060, rate: 2060, min: 100, max: 100000 },
    { id: 2, name: "Telegram Group/Channel Member | ရက်၉၀ပြန်မကျ✅", providerId: 3200, rate: 3200, min: 100, max: 100000 },
    { id: 3, name: "Telegram Group/Channel Member | တစ်သက်စာပြန်မကျ✅", providerId: 6450, rate: 6450, min: 100, max: 100000 },
    { id: 4, name: "Telegram Reaction [❤️💋🥰]✅", providerId: 280, rate: 280, min: 100, max: 100000 },
    { id: 5, name: "Tiktok Like [🚀Super Fast Speed] ပြန်မကျ 30Day", providerId: 2000, rate: 2000, min: 100, max: 100000 },
    { id: 6, name: "Tiktok Like [🚀Super Fast Speed] ပြန်မကျ Lifetime", providerId: 2500, rate: 2500, min: 100, max: 100000 }
];

let userState = {
    balance: 50000, // Demo Initial Balance
    orders: [],
    payments: []
};

let isAdminLoggedIn = false;

// --- 2. TAB CONTROLLER ---
function switchTab(tabId) {
    document.querySelectorAll('.page-panel').forEach(panel => panel.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    const target = document.getElementById(tabId);
    if (target) target.classList.add('active');

    if(tabId === 'u-order') renderServiceOptions();
    if(tabId === 'a-services') renderAdminServices();
    if(tabId === 'u-history') renderUserOrders();
    if(tabId === 'a-orders') renderAdminOrders();
    if(tabId === 'a-payments') renderAdminPayments();
}

// --- 3. AUTO ORDER SYSTEM ENGINE ---
async function sendAutoOrderToProvider(serviceProviderId, link, quantity) {
    const payload = {
        key: CONFIG.MAIN_PROVIDER_KEY,
        action: 'add',
        service: serviceProviderId,
        link: link,
        quantity: quantity
    };

    try {
        console.log("Sending Auto Order to Main Provider API:", payload);
        // Simulation of SMM V2 API Success Response
        return { status: "success", order: Math.floor(100000 + Math.random() * 900000) };
    } catch (err) {
        console.error("Auto Order Delivery Failed:", err);
        return { status: "failed", error: err.message };
    }
}

// --- 4. USER FUNCTIONS ---
function renderServiceOptions() {
    const select = document.getElementById('service-select');
    select.innerHTML = servicesData.map(s => 
        `<option value="${s.id}">${s.name} - ${s.rate} Ks/1000</option>`
    ).join('');
    calculatePrice();
}

function calculatePrice() {
    const serviceId = parseInt(document.getElementById('service-select').value);
    const qty = parseInt(document.getElementById('order-quantity').value) || 0;
    const service = servicesData.find(s => s.id === serviceId);
    
    if (service) {
        const total = (qty / 1000) * service.rate;
        document.getElementById('order-total-price').value = `${total.toFixed(0)} Ks`;
    }
}

async function handlePlaceOrder(e) {
    e.preventDefault();
    const serviceId = parseInt(document.getElementById('service-select').value);
    const link = document.getElementById('order-link').value;
    const qty = parseInt(document.getElementById('order-quantity').value);
    const service = servicesData.find(s => s.id === serviceId);
    
    const cost = (qty / 1000) * service.rate;

    if (userState.balance < cost) {
        alert("လက်ကျန်ငွေ မလုံလောက်ပါ။ ကျေးဇူးပြု၍ ငွေကြိုတင်ဖြည့်ပါ။");
        return;
    }

    userState.balance -= cost;
    document.getElementById('user-balance-display').innerText = `${userState.balance} Ks`;

    const apiResponse = await sendAutoOrderToProvider(service.providerId, link, qty);

    const newOrder = {
        id: userState.orders.length + 1,
        serviceName: service.name,
        providerId: service.providerId,
        link: link,
        qty: qty,
        price: cost,
        providerOrderId: apiResponse.order || 'Failed',
        status: apiResponse.status === 'success' ? 'Processing (Auto)' : 'Failed'
    };

    userState.orders.push(newOrder);
    alert("အော်ဒါ အောင်မြင်စွာ တင်ပြီးပါပြီ။ Main Provider သို့ Auto Order တက်သွားပါပြီ။");
    switchTab('u-history');
}

function renderUserOrders() {
    const tbody = document.getElementById('user-order-table-body');
    tbody.innerHTML = userState.orders.map(o => `
        <tr>
            <td>#${o.id}</td>
            <td>${o.serviceName}</td>
            <td>${o.link}</td>
            <td>${o.qty}</td>
            <td>${o.price} Ks</td>
            <td><span class="badge badge-success">${o.status}</span></td>
        </tr>
    `).join('');
    document.getElementById('user-total-orders').innerText = userState.orders.length;
}

function handleTopUp(e) {
    e.preventDefault();
    const amount = document.getElementById('topup-amount').value;
    const method = document.getElementById('topup-method').value;
    const txid = document.getElementById('topup-txid').value;

    userState.payments.push({
        id: txid,
        method: method,
        amount: amount,
        status: 'Pending'
    });

    alert("ငွေဖြည့်သွင်းမှု တောင်းဆိုပြီးပါပြီ။ Admin မှ စစ်ဆေးအတည်ပြုပေးပါမည်။");
    document.getElementById('admin-pending-payments').innerText = userState.payments.length;
}

// --- 5. ADMIN FUNCTIONS ---
function handleAdminLogin(e) {
    e.preventDefault();
    const user = document.getElementById('admin-user').value;
    const pass = document.getElementById('admin-pass').value;
    const pin = document.getElementById('admin-pin').value;

    if (user === "Admin" && pass === "htetmyatoo2580" && pin === "htetmyatoo2012") {
        isAdminLoggedIn = true;
        alert("Admin Dashboard သို့ အောင်မြင်စွာ ဝင်ရောက်ပြီးပါပြီ။");
        switchTab('a-dashboard');
    } else {
        alert("Username/Password သို့မဟုတ် Pin မှားယွင်းနေပါသည်။");
    }
}

function handleAddService(e) {
    e.preventDefault();
    const name = document.getElementById('service-name').value;
    const providerId = parseInt(document.getElementById('service-provider-id').value);
    const rate = parseFloat(document.getElementById('service-rate').value);
    const min = parseInt(document.getElementById('service-min').value);
    const max = parseInt(document.getElementById('service-max').value);

    const newService = {
        id: servicesData.length + 1,
        name: name,
        providerId: providerId,
        rate: rate,
        min: min,
        max: max
    };

    servicesData.push(newService);
    alert("ဝန်ဆောင်မှုအသစ် အောင်မြင်စွာ ထည့်သွင်းပြီးပါပြီ။");
    renderAdminServices();
}

function renderAdminServices() {
    const tbody = document.getElementById('admin-services-table');
    tbody.innerHTML = servicesData.map(s => `
        <tr>
            <td>${s.id}</td>
            <td>${s.name}</td>
            <td><b>${s.providerId}</b></td>
            <td>${s.rate} Ks</td>
            <td>${s.min} - ${s.max}</td>
            <td><button class="btn btn-sm btn-danger" onclick="deleteService(${s.id})">Delete</button></td>
        </tr>
    `).join('');
}

function deleteService(id) {
    servicesData = servicesData.filter(s => s.id !== id);
    renderAdminServices();
}

function renderAdminOrders() {
    const tbody = document.getElementById('admin-orders-table');
    document.getElementById('admin-order-count').innerText = userState.orders.length;
    tbody.innerHTML = userState.orders.map(o => `
        <tr>
            <td>#${o.id}</td>
            <td>${o.link}</td>
            <td>${o.providerId}</td>
            <td>${o.qty}</td>
            <td>#${o.providerOrderId}</td>
            <td><span class="badge badge-success">Auto Order Sent</span></td>
        </tr>
    `).join('');
}

function renderAdminPayments() {
    const tbody = document.getElementById('admin-payments-table');
    tbody.innerHTML = userState.payments.map((p, idx) => `
        <tr>
            <td>${p.id}</td>
            <td>${p.method}</td>
            <td>${p.amount} Ks</td>
            <td><span class="badge badge-pending">${p.status}</span></td>
            <td><button class="btn btn-sm" onclick="approvePayment(${idx})">Approve</button></td>
        </tr>
    `).join('');
}

function approvePayment(index) {
    const payment = userState.payments[index];
    payment.status = 'Approved';
    userState.balance += parseFloat(payment.amount);
    document.getElementById('user-balance-display').innerText = `${userState.balance} Ks`;
    alert(`ငွေဖြည့်သွင်းမှု ${payment.amount} Ks အား အတည်ပြုပေးလိုက်ပါပြီ။`);
    renderAdminPayments();
}

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('user-balance-display').innerText = `${userState.balance} Ks`;
});
                                       
