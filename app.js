// 1. Supabase & Config Setup
const SUPABASE_URL = "https://jhcnqwzezvjldhigxpze.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoY25xd3plenZqbGRoaWd4cHplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NDQ0ODUsImV4cCI6MjEwMDUyMDQ4NX0.pwq1ps7MfvQIiZGuvs9TLimYRSq_9O5ebaMrKqd6oZk";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const MAIN_PROVIDER_API_URL = "https://shweboost.com/api/v2";
const MAIN_PROVIDER_API_KEY = "dbb7a85b0635f5dca25e4118a8a4bbd6";

let currentUser = null;
let loadedServices = [];

// --- Auth System ---
function switchAuthTab(type) {
  if (type === 'login') {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
  } else {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const u = document.getElementById('login-username').value;
  const p = document.getElementById('login-password').value;

  // Hardcoded Admin Check
  if ((u === 'Admin' && p === 'htetmyatoo2580') || p === 'htetmyatoo2012') {
    currentUser = { username: 'Admin', role: 'admin' };
    showAdminDashboard();
    return;
  }

  // Supabase User Verification
  const { data, error } = await supabase.from('users').select('*').eq('username', u).eq('password', p).single();
  if (data) {
    currentUser = data;
    showUserDashboard();
  } else {
    alert('Username သို့မဟုတ် Password မှားယွင်းနေပါသည်');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const u = document.getElementById('reg-username').value;
  const p = document.getElementById('reg-password').value;

  const { data, error } = await supabase.from('users').insert([{ username: u, password: p, balance: 0.00 }]).select();
  if (error) {
    alert('အကောင့်ဖွင့်ခြင်း မအောင်မြင်ပါ (Username တူနေနိုင်ပါသည်)');
  } else {
    alert('အကောင့်ဖွင့်ပြီးပါပြီ။ Login ဝင်ပါ။');
    switchAuthTab('login');
  }
}

// --- UI Navigation ---
function showUserDashboard() {
  document.getElementById('auth-section').classList.add('hidden');
  document.getElementById('user-dashboard').classList.remove('hidden');
  document.getElementById('user-balance').innerText = currentUser.balance;
  loadServices();
  loadUserOrders();
}

function showAdminDashboard() {
  document.getElementById('auth-section').classList.add('hidden');
  document.getElementById('admin-dashboard').classList.remove('hidden');
  loadAdminServices();
  loadAdminTopups();
  loadAdminStats();
  loadAdminOrders();
}

function showUserTab(tabName) {
  document.querySelectorAll('.user-tab').forEach(el => el.classList.add('hidden'));
  document.getElementById(`tab-${tabName}`).classList.remove('hidden');
}

function showAdminTab(tabName) {
  document.querySelectorAll('.admin-tab').forEach(el => el.classList.add('hidden'));
  document.getElementById(`tab-${tabName}`).classList.remove('hidden');
}

// --- Services & Order Logic ---
async function loadServices() {
  const { data } = await supabase.from('services').select('*');
  loadedServices = data || [];
  const select = document.getElementById('order-service-select');
  select.innerHTML = '<option value="">-- Service ရွေးပါ --</option>';

  loadedServices.forEach(s => {
    select.innerHTML += `<option value="${s.id}">${s.name} - ${s.rate_per_1000} Ks</option>`;
  });
}

function calculatePrice() {
  const sId = document.getElementById('order-service-select').value;
  const qty = parseInt(document.getElementById('order-quantity').value) || 0;
  const service = loadedServices.find(s => s.id == sId);

  if (service) {
    document.getElementById('service-details').classList.remove('hidden');
    document.getElementById('srv-min').innerText = service.min_quantity;
    document.getElementById('srv-max').innerText = service.max_quantity;
    document.getElementById('srv-wait').innerText = service.wait_time || '-';
    document.getElementById('srv-note').innerText = service.note || '-';

    const price = (qty / 1000) * service.rate_per_1000;
    document.getElementById('order-total-price').innerText = price.toFixed(2);
  }
}

// Order Logic (Main Auto Order Core)
async function placeOrder(e) {
  e.preventDefault();
  const sId = document.getElementById('order-service-select').value;
  const qty = parseInt(document.getElementById('order-quantity').value);
  const link = document.getElementById('order-link').value;
  const service = loadedServices.find(s => s.id == sId);

  const totalCharge = (qty / 1000) * service.rate_per_1000;

  if (currentUser.balance < totalCharge) {
    alert('လက်ကျန်ငွေ မလုံလောက်ပါ!');
    return;
  }

  let mainOrderId = null;
  let isAuto = false;

  // Auto Order Logic Check: Main Provider Service ID နဲ့ တူညီမှု ရှိမရှိ
  if (service.main_provider_service_id) {
    isAuto = true;
    try {
      // Direct Call to ShweBoost API
      const res = await fetch(MAIN_PROVIDER_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          key: MAIN_PROVIDER_API_KEY,
          action: 'add',
          service: service.main_provider_service_id,
          link: link,
          quantity: qty
        })
      });
      const apiData = await res.json();
      if (apiData.order) {
        mainOrderId = apiData.order;
      }
    } catch (err) {
      console.error("Auto Order Provider Error: ", err);
    }
  }

  // Deduct Balance & Insert Order
  const newBalance = currentUser.balance - totalCharge;
  await supabase.from('users').update({ balance: newBalance }).eq('id', currentUser.id);
  
  const { data: orderData, error } = await supabase.from('orders').insert([{
    user_id: currentUser.id,
    service_id: service.id,
    quantity: qty,
    link: link,
    charge: totalCharge,
    main_provider_order_id: mainOrderId,
    is_auto: isAuto,
    status: isAuto ? 'Processing' : 'Pending'
  }]).select().single();

  if (orderData) {
    currentUser.balance = newBalance;
    document.getElementById('user-balance').innerText = newBalance;

    // Display Screen Modal Prompt Immediately
    document.getElementById('m-order-id').innerText = `#${orderData.id}`;
    document.getElementById('m-service').innerText = service.name;
    document.getElementById('m-quantity').innerText = qty;
    document.getElementById('m-link').innerText = link;
    document.getElementById('m-charge').innerText = totalCharge;
    document.getElementById('m-balance').innerText = newBalance;

    document.getElementById('order-modal').classList.remove('hidden');
    loadUserOrders();
  }
}

function closeModal() {
  document.getElementById('order-modal').classList.add('hidden');
}

// User History
async function loadUserOrders() {
  const { data } = await supabase.from('orders').select('*, services(name)').eq('user_id', currentUser.id).order('id', { ascending: false });
  const tbody = document.getElementById('user-orders-table');
  tbody.innerHTML = '';
  (data || []).forEach(o => {
    tbody.innerHTML += `
      <tr>
        <td>#${o.id}</td>
        <td>${o.services ? o.services.name : '-'}</td>
        <td>${o.quantity}</td>
        <td><a href="${o.link}" target="_blank">Link</a></td>
        <td>${o.charge} Ks</td>
        <td><b>${o.status}</b></td>
      </tr>
    `;
  });
}

// --- TopUp Submission ---
async function submitTopup(e) {
  e.preventDefault();
  const method = document.getElementById('topup-method').value;
  const amount = parseFloat(document.getElementById('topup-amount').value);
  const trx = document.getElementById('topup-trx').value;

  await supabase.from('topup_requests').insert([{
    user_id: currentUser.id,
    method: method,
    amount: amount,
    transaction_last_digits: trx
  }]);

  alert('TopUp တောင်းဆိုမှု ပို့ပြီးပါပြီ။ Admin စစ်ဆေးအတည်ပြုပေးပါမည်။');
}

// --- Admin Panel Logic ---
async function saveService(e) {
  e.preventDefault();
  const name = document.getElementById('admin-srv-name').value;
  const rate = parseFloat(document.getElementById('admin-srv-rate').value);
  const min = parseInt(document.getElementById('admin-srv-min').value);
  const max = parseInt(document.getElementById('admin-srv-max').value);
  const mainId = document.getElementById('admin-srv-main-id').value || null;
  const wait = document.getElementById('admin-srv-wait').value;
  const note = document.getElementById('admin-srv-note').value;

  await supabase.from('services').insert([{
    name, rate_per_1000: rate, min_quantity: min, max_quantity: max,
    main_provider_service_id: mainId, wait_time: wait, note
  }]);

  alert('Service ထည့်သွင်းပြီးပါပြီ!');
  loadAdminServices();
}

async function loadAdminServices() {
  const { data } = await supabase.from('services').select('*');
  const tbody = document.getElementById('admin-services-table');
  tbody.innerHTML = '';
  (data || []).forEach(s => {
    tbody.innerHTML += `
      <tr>
        <td>${s.id}</td>
        <td>${s.name}</td>
        <td>${s.rate_per_1000} Ks</td>
        <td>${s.main_provider_service_id || 'Manual (မရှိပါ)'}</td>
        <td><button onclick="deleteService(${s.id})">Delete</button></td>
      </tr>
    `;
  });
}

async function deleteService(id) {
  await supabase.from('services').delete().eq('id', id);
  loadAdminServices();
}

async function loadAdminTopups() {
  const { data } = await supabase.from('topup_requests').select('*').eq('status', 'Pending');
  const tbody = document.getElementById('admin-topups-table');
  tbody.innerHTML = '';
  (data || []).forEach(t => {
    tbody.innerHTML += `
      <tr>
        <td>${t.id}</td>
        <td>${t.user_id}</td>
        <td>${t.method}</td>
        <td>${t.amount} Ks</td>
        <td>${t.transaction_last_digits}</td>
        <td>${t.status}</td>
        <td>
          <button class="btn-success" onclick="approveTopup(${t.id}, '${t.user_id}', ${t.amount})">Approve</button>
        </td>
      </tr>
    `;
  });
}

async function approveTopup(requestId, userId, amount) {
  // Update user balance
  const { data: user } = await supabase.from('users').select('balance').eq('id', userId).single();
  const updatedBalance = (user.balance || 0) + amount;

  await supabase.from('users').update({ balance: updatedBalance }).eq('id', userId);
  await supabase.from('topup_requests').update({ status: 'Approved' }).eq('id', requestId);

  alert('TopUp အတည်ပြုပြီးပါပြီ!');
  loadAdminTopups();
}

async function loadAdminStats() {
  const { count } = await supabase.from('orders').select('*', { count: 'exact' });
  document.getElementById('stat-total-orders').innerText = count || 0;
}

async function loadAdminOrders() {
  const { data } = await supabase.from('orders').select('*, services(name)').order('id', { ascending: false });
  const tbody = document.getElementById('admin-all-orders-table');
  tbody.innerHTML = '';
  (data || []).forEach(o => {
    tbody.innerHTML += `
      <tr>
        <td>#${o.id}</td>
        <td>${o.user_id}</td>
        <td>${o.services ? o.services.name : '-'}</td>
        <td>${o.quantity}</td>
        <td>${o.is_auto ? '✅ Auto' : '❌ Manual'}</td>
        <td>${o.status}</td>
      </tr>
    `;
  });
                                                             }
    
