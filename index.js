const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');

// === CONFIG ===
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = '-1002353520070'; // Replace with your channel ID
const ADMIN_ID = 6101660516;         // Replace with your Telegram ID

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

let broadcasting = false;
let broadcastInterval = null;
let messageCount = 0;
const logs = [];

// === Review Messages ===
const reviews = [
  "🌟 This app is amazing! I’ve earned so much in just a week.",
  "💯 Legit and super easy to use. Highly recommend!",
  "🔥 Just got my first payment today. Thanks guys!",
  "👏 I’ve referred my friends and we’re all enjoying the rewards.",
  "✅ Everything works smoothly. Best app I’ve used this year.",
  "😎 Great support and instant withdrawals. Keep it up!",
  "💸 Earnings drop daily like clockwork. Love it!",
  "👌 Simple UI, fast payments, no stress.",
  "🙌 Got paid without any issues. Real deal!",
  "🤑 Was skeptical at first but it’s real. Highly recommended!",
  "💥 Earnbuzz changed my life! I'm earning more than I expected.",
  "📝 The referral system is genius. I've already invited a few friends!",
  "💰 Fast withdrawals and no problems with my account. Definitely a win!",
  "🚀 Super easy to get started and the earnings are consistent.",
  "🎉 I’ve been using it for a month now and everything is going smoothly.",
  "📲 This is the app I’ve been looking for. It’s simple and effective.",
  "🙌 Love how easy it is to track my earnings and withdrawals!",
  "⚡ Fast and reliable payments every time. Couldn’t ask for more.",
  "⭐ The daily faucet is a great way to build up small earnings over time.",
  "🖥️ Smooth interface and quick payments make Earnbuzz a top choice."
];

const firstNames = [ "Chinedu", "Aisha", "Tunde", "Ngozi", "Emeka", "Fatima", "Ibrahim", "Kelechi" ];
const lastNames = [ "Okoro", "Bello", "Oladipo", "Nwankwo", "Eze", "Musa", "Lawal", "Umeh" ];

function getRandomNigerianName() {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${first} ${last}`;
}

function sendReviewMessage() {
  const review = reviews[Math.floor(Math.random() * reviews.length)];
  const name = getRandomNigerianName();
  const message = `${review}\n—from *${name}*`;

  bot.sendMessage(CHANNEL_ID, message, { parse_mode: "Markdown" });
  messageCount++;
  logs.unshift(`[${new Date().toLocaleTimeString()}] Sent: ${message}`);
  if (logs.length > 20) logs.pop(); // Keep log short
}

function startBroadcasting() {
  if (broadcasting) return;
  broadcasting = true;
  messageCount = 0;
  broadcastInterval = setInterval(() => {
    if (!broadcasting || messageCount >= 500) {
      stopBroadcasting();
      return;
    }
    sendReviewMessage();
  }, 60000); // 1 minute
}

function stopBroadcasting() {
  broadcasting = false;
  if (broadcastInterval) {
    clearInterval(broadcastInterval);
    broadcastInterval = null;
  }
}

// === Telegram Bot Admin Commands ===
bot.onText(/\/start/, (msg) => {
  if (msg.chat.id == ADMIN_ID) {
    bot.sendMessage(msg.chat.id, "✅ Review broadcasting started.");
    startBroadcasting();
  } else {
    bot.sendMessage(msg.chat.id, "❌ You are not authorized.");
  }
});

bot.onText(/\/stop/, (msg) => {
  if (msg.chat.id == ADMIN_ID) {
    bot.sendMessage(msg.chat.id, "🛑 Review broadcasting stopped.");
    stopBroadcasting();
  } else {
    bot.sendMessage(msg.chat.id, "❌ You are not authorized.");
  }
});

// === Web Dashboard ===
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Earnbuzz Broadcast Dashboard</title></head>
      <body style="font-family:sans-serif;padding:20px;">
        <h1>📡 Earnbuzz Review Broadcaster</h1>
        <p>Status: <b>${broadcasting ? '🟢 Running' : '🔴 Stopped'}</b></p>
        <p>Messages sent: ${messageCount}</p>
        <form method="POST" action="/start">
          <button type="submit">▶️ Start Broadcasting</button>
        </form>
        <form method="POST" action="/stop" style="margin-top:10px;">
          <button type="submit">⛔ Stop Broadcasting</button>
        </form>
        <h3>Recent Logs</h3>
        <pre>${logs.join('\n')}</pre>
      </body>
    </html>
  `);
});

app.post('/start', (req, res) => {
  startBroadcasting();
  res.redirect('/');
});

app.post('/stop', (req, res) => {
  stopBroadcasting();
  res.redirect('/');
});

// === Start Server ===
const PORT = process.env.PORT || 3000;
http.createServer(app).listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
