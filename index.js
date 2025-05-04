const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const TelegramBot = require('node-telegram-bot-api');

// === CONFIG ===
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = '-1002491864473'; // Replace with your channel ID
const ADMIN_ID = 6101660516;         // Replace with your Telegram ID

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// === Session Middleware ===
app.use(session({
  secret: 'your-secret-key', 
  resave: false, 
  saveUninitialized: true,
}));

// === Credentials (Username and Hashed Password) ===
const adminUsername = "earnbuzz";
const adminPasswordHash = "$2a$10$O7uA3rg2zYwW0pZgk9mjuehSxFfdkgrU5jLQje1n7fWcOUtIHtDqG";  // Hashed version of "pass"

// === Login Check ===
app.get('/login', (req, res) => {
  res.send(`
    <html>
      <head><title>Login</title><link href="/styles.css" rel="stylesheet"></head>
      <body class="bg-gray-100 flex justify-center items-center h-screen">
        <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-xs">
          <h1 class="text-3xl font-bold mb-6 text-center">Login to Dashboard</h1>
          <form method="POST" action="/login" class="space-y-4">
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
              <input type="text" id="username" name="username" class="w-full px-4 py-2 border rounded-md shadow-sm" required>
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
              <input type="password" id="password" name="password" class="w-full px-4 py-2 border rounded-md shadow-sm" required>
            </div>
            <div>
              <button type="submit" class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">Login</button>
            </div>
          </form>
        </div>
      </body>
    </html>
  `);
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check if the username and password match
  if (username === adminUsername && bcrypt.compareSync(password, adminPasswordHash)) {
    req.session.loggedIn = true;
    return res.redirect('/');
  }

  res.send(`
    <html>
      <head><title>Login</title><link href="/styles.css" rel="stylesheet"></head>
      <body class="bg-gray-100 flex justify-center items-center h-screen">
        <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-xs">
          <h1 class="text-3xl font-bold mb-6 text-center">Login Failed</h1>
          <p class="text-red-600 text-center">Invalid credentials. Please try again.</p>
          <form method="POST" action="/login" class="space-y-4 mt-4">
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
              <input type="text" id="username" name="username" class="w-full px-4 py-2 border rounded-md shadow-sm" required>
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
              <input type="password" id="password" name="password" class="w-full px-4 py-2 border rounded-md shadow-sm" required>
            </div>
            <div>
              <button type="submit" class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">Login</button>
            </div>
          </form>
        </div>
      </body>
    </html>
  `);
});

// === Broadcast Control ===
let broadcasting = false;
let broadcastInterval = null;
let messageCount = 0;
const logs = [];

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
  "🤑 Was skeptical at first but it’s real. Highly recommended!"
];

// === Review Messages ===
function getRandomNigerianName() {
  const firstNames = ["Chinedu", "Aisha", "Tunde", "Ngozi", "Emeka"];
  const lastNames = ["Okoro", "Bello", "Oladipo", "Nwankwo", "Eze"];
  
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

// === Web Dashboard ===
app.get('/', (req, res) => {
  if (!req.session.loggedIn) {
    return res.redirect('/login');
  }

  res.send(`
    <html>
      <head><title>Earnbuzz Broadcast Dashboard</title><link href="/styles.css" rel="stylesheet"></head>
      <body class="bg-gray-100 flex justify-center items-center h-screen">
        <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-3xl">
          <h1 class="text-3xl font-bold mb-6 text-center">📡 Earnbuzz Review Broadcaster</h1>
          <p class="text-xl mb-4">Status: <b class="${broadcasting ? 'text-green-500' : 'text-red-500'}">${broadcasting ? '🟢 Running' : '🔴 Stopped'}</b></p>
          <p class="mb-4">Messages sent: ${messageCount}</p>
          <form method="POST" action="/start" class="mb-2">
            <button type="submit" class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">▶️ Start Broadcasting</button>
          </form>
          <form method="POST" action="/stop">
            <button type="submit" class="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600">⛔ Stop Broadcasting</button>
          </form>
          <h3 class="mt-6 font-semibold">Recent Logs</h3>
          <pre class="bg-gray-800 text-white p-4 rounded-md max-h-64 overflow-y-scroll">${logs.join('\n')}</pre>
        </div>
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
