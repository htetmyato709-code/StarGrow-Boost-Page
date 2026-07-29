// Supabase Configuration
const SUPABASE_URL = 'https://jhcnqwzezvjldhigxpze.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoY25xd3plenZqbGRoaWd4cHplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NDQ0ODUsImV4cCI6MjEwMDUyMDQ4NX0.pwq1ps7MfvQIiZGuvs9TLimYRSq_9O5ebaMrKqd6oZk';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Admin Credentials
const ADMIN_USER = "Admin";
const ADMIN_PASS = "htetmyatoo2580";

// Tab Switching
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
}

// Admin Login Handle
document.getElementById('admin-login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const user = document.getElementById('admin-user').value;
    const pass = document.getElementById('admin-pass').value;

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
        alert("Admin Login အောင်မြင်ပါသည်။");
        document.getElementById('admin-login-box').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
    } else {
        alert("Admin Username သို့မဟုတ် Password မှားယွင်းနေပါသည်။");
    }
});

function adminLogout() {
    document.getElementById('admin-login-box').style.display = 'block';
    document.getElementById('admin-panel').style.display = 'none';
}

// User TopUp Request Handle
document.getElementById('topup-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const method = document.getElementById('topup-method').value;
    const amount = document.getElementById('topup-amount').value;
    const txid = document.getElementById('topup-txid').value;

    // Insert TopUp Data to Supabase Table (topup_requests)
    const { data, error } = await supabase
        .from('topup_requests')
        .insert([{ payment_method: method, amount: amount, transaction_id: txid, status: 'Pending' }]);

    if (error) {
        console.log("Supabase Error:", error);
        alert("TopUp တောင်းဆိုမှု မှတ်တမ်းတင်ခြင်း အဆင်မပြေပါ။ (Demo Mode)");
    } else {
        alert("TopUp Request တင်ပြီးပါပြီ။ Admin မှ စစ်ဆေးပြီးပါက Wallet ထဲသို့ ငွေရောက်ရှိလာပါမည်။");
    }
    
    // UI Update for Demo Purposes
    addPendingTopUpToAdmin(method, amount, txid);
    document.getElementById('topup-form').reset();
});

// Demo: Append Request to Admin Table View
function addPendingTopUpToAdmin(method, amount, txid) {
    const list = document.getElementById('topup-request-list');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${method}</td>
        <td>${amount} Ks</td>
        <td>${txid}</td>
        <td><span style="color:orange;">Pending</span></td>
        <td><button class="btn-approve" onclick="approveTopup(this, ${amount})">Approve</button></td>
    `;
    list.appendChild(row);
}

// Admin Approve TopUp
function approveTopup(btn, amount) {
    let currentBalance = parseInt(document.getElementById('user-balance').innerText);
    currentBalance += parseInt(amount);
    document.getElementById('user-balance').innerText = currentBalance;
    
    btn.parentElement.parentElement.querySelector('td:nth-child(4)').innerHTML = '<span style="color:green;">Approved</span>';
    btn.disabled = true;
    btn.style.background = '#ccc';
    alert("TopUp အတည်ပြုပြီးပါပြီ။ User Balance ထဲသို့ ငွေပေါင်းထည့်လိုက်ပါသည်။");
}
// Owner / Admin Credentials Setup
const OWNER_CREDENTIALS = {
    email: "htetmyato709@gmail.com",
    username: "Admin",
    password: "htetmyatoo2580",
    dashPassword: "htetmyatoo2012"
};

// Admin Login Process
document.getElementById('admin-login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const userInput = document.getElementById('admin-user').value.trim();
    const passInput = document.getElementById('admin-pass').value;
    const dashPassInput = document.getElementById('admin-dash-pass').value;

    // Email သို့မဟုတ် Username မှန်ကန်မှု စစ်ဆေးခြင်း
    const isUserValid = (userInput === OWNER_CREDENTIALS.email || userInput === OWNER_CREDENTIALS.username);
    
    // Password နှင့် Dashboard Code စစ်ဆေးခြင်း
    const isPassValid = (passInput === OWNER_CREDENTIALS.password);
    const isDashPassValid = (dashPassInput === OWNER_CREDENTIALS.dashPassword);

    if (isUserValid && isPassValid && isDashPassValid) {
        alert("✅ Owner Verification အောင်မြင်ပါသည်။ Dashboard သို့ ဝင်ရောက်ပါပြီ။");
        document.getElementById('admin-login-box').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
    } else {
        alert("❌ Login အချက်အလက် သို့မဟုတ် Admin Dashboard Code မှားယွင်းနေပါသည်။");
    }
});

// Admin Logout Function
function adminLogout() {
    document.getElementById('admin-login-box').style.display = 'block';
    document.getElementById('admin-panel').style.display = 'none';
    document.getElementById('admin-login-form').reset();
}
