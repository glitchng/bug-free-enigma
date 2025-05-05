const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');

// === CONFIG ===
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = '-1002491864473'; // Replace with your channel ID
const ADMIN_ID = 6101660516;         // Replace with your Telegram ID

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// === Broadcasting State ===
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
      <head>
        <title>Earnbuzz Broadcast Dashboard</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body id="body" class="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-200 font-sans p-6 transition-all">
        <div class="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <!-- Logo -->
          <div class="flex justify-center mb-8">
            <img src="https://imgur.com/a/2hUkPwV" alt="Earnbuzz Logo" class="w-24 h-24 object-cover rounded-full" />
          </div>

          <h1 class="text-4xl font-extrabold text-center text-indigo-600 mb-8">📡 Earnbuzz Review Broadcaster</h1>
          <div class="text-center mb-6">
            <p class="text-lg ${broadcasting ? 'text-green-500' : 'text-red-500'}">Status: <b class="font-semibold">${broadcasting ? '🟢 Running' : '🔴 Stopped'}</b></p>
            <p class="mb-4 text-xl">Messages Sent: <span class="text-2xl font-bold text-gray-800 dark:text-gray-100">${messageCount}</span></p>
            <div class="space-x-4">
              <form method="POST" action="/start" class="inline-block">
                <button type="submit" class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all">▶️ Start Broadcasting</button>
              </form>
              <form method="POST" action="/stop" class="inline-block">
                <button type="submit" class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all">⛔ Stop Broadcasting</button>
              </form>
            </div>
            <!-- Dark Mode Toggle -->
            <div class="mt-4">
              <button id="darkModeToggle" class="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all">🌓 Toggle Dark Mode</button>
            </div>
          </div>
          
          <h3 class="text-2xl font-bold mb-2 text-center">Recent Logs</h3>
          <pre class="bg-gray-800 text-white p-4 rounded-md mt-4 max-h-96 overflow-y-auto">${logs.join('\n')}</pre>
        </div>

        <script>
          // Dark Mode Toggle Logic
          const darkModeToggle = document.getElementById('darkModeToggle');
          const body = document.getElementById('body');

          // Check saved preference from localStorage
          if (localStorage.getItem('darkMode') === 'true') {
            body.classList.add('dark');
          }

          darkModeToggle.addEventListener('click', () => {
            body.classList.toggle('dark');
            // Save preference in localStorage
            localStorage.setItem('darkMode', body.classList.contains('dark'));
          });
        </script>
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
