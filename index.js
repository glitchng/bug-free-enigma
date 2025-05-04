const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');

// === CONFIGURATION ===
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = '-1002353520070'; // Replace with your channel ID
const ADMIN_ID = 6101660516;         // Replace with your Telegram ID

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

let broadcasting = false;
let broadcastInterval = null;
let messageCount = 0;
let logs = [];

// === Reviews ===
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

// === Nigerian Name Generator ===
const firstNames = [ "Chinedu", "Aisha", "Tunde", "Ngozi", "Emeka", "Fatima", "Ibrahim", "Kelechi", "Seyi", "Adaobi", "Bola", "Obinna", "Zainab", "Yusuf", "Amaka", "David", "Grace", "Uche", "Tope", "Nneka", "Samuel", "Maryam", "Gbenga", "Rashida", "Kingsley", "Temitope", "Hadiza", "John", "Blessing", "Peter", "Linda", "Ahmed", "Funmi", "Rita", "Abdul", "Chika", "Paul", "Victoria", "Halima", "Ifeanyi", "Sarah", "Joseph", "Joy", "Musa", "Bukky", "Stephen", "Aminat", "Henry", "Femi", "Micheal", "Modupe", "Yemisi", "Titi", "Chijioke", "Oluwaseun", "Durojaiye", "Fatimah", "Ademola", "Ifeoluwa", "Hassan", "Aderemi", "Idris", "Ekong", "Ivy", "Uko", "Eyo", "Abasiama", "Mfon", "Mbakara", "Nkechi", "Idorenyin", "Martha", "Ita", "Akpan", "Essien", "Obong", "Ikot", "Inyang", "Ntia", "Akpabio", "Etim", "Inyene", "Ndiana", "Udoh", "Akanimoh", "Udo", "Ukpong" ];
const lastNames = [ "Okoro", "Bello", "Oladipo", "Nwankwo", "Eze", "Musa", "Lawal", "Umeh", "Bakare", "Okafor", "Adeyemi", "Mohammed", "Onyeka", "Ibrahim", "Ogunleye", "Balogun", "Chukwu", "Usman", "Abiola", "Okonkwo", "Aliyu", "Ogundele", "Danladi", "Ogbonna", "Salami", "Olumide", "Obi", "Akinwale", "Suleiman", "Ekwueme", "Ayodele", "Garba", "Nwachukwu", "Anyanwu", "Yahaya", "Idowu", "Ezra", "Mustapha", "Iroko", "Ajayi", "Adebayo", "Ogundipe", "Nuhu", "Bamgbose", "Ikenna", "Osagie", "Akinyemi", "Chisom", "Oladele", "Adeleke", "Fashola", "Taiwo", "Tiwatope", "Onyebuchi", "Ikechukwu", "Nnaji", "Ogunbiyi", "Sule", "Muhammad", "Alabi", "Oloyede", "Etim", "Bassey", "Otu", "Akpabio", "Ubong" ];

function getRandomNigerianName() {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${first} ${last}`;
}

// === Message Sender ===
function sendReviewMessage() {
  const review = reviews[Math.floor(Math.random() * reviews.length)];
  const name = getRandomNigerianName();
  const message = `${review}\n—from *${name}*`;

  bot.sendMessage(CHANNEL_ID, message, { parse_mode: "Markdown" });

  const timestamp = new Date().toLocaleString();
  logs.unshift(`[${timestamp}] ${message}`);
  logs = logs.slice(0, 10); // Keep only last 10
}

// === Broadcast Control ===
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
    messageCount++;
  }, 60000); // 1 minute
}

function stopBroadcasting() {
  broadcasting = false;
  if (broadcastInterval) {
    clearInterval(broadcastInterval);
    broadcastInterval = null;
  }
}

// === Telegram Bot Commands ===
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
      <head><title>Broadcast Control</title></head>
      <body style="font-family:sans-serif; text-align:center; margin-top:40px;">
        <h2>📢 Broadcast Control Panel</h2>
        <form method="POST" action="/start">
          <button type="submit" style="padding:10px 20px;">Start Broadcasting</button>
        </form>
        <br />
        <form method="POST" action="/stop">
          <button type="submit" style="padding:10px 20px;">Stop Broadcasting</button>
        </form>
        <p>Status: <strong>${broadcasting ? 'Running' : 'Stopped'}</strong></p>
        <p>Messages Sent Today: <strong>${messageCount}</strong></p>
        <h3>📝 Last 10 Messages</h3>
        <div style="max-width:700px; margin:0 auto; text-align:left; font-size:14px;">
          <ul>
            ${logs.map(log => `<li>${log}</li>`).join('')}
          </ul>
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

// === Web Server ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Web dashboard running on port ${PORT}`);
});
