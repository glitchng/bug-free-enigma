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
  "🌟 I’ve tried countless “earn money online” platforms, and honestly, most of them were either full of ads or made it nearly impossible to withdraw. Earnbuzz was different from day one. It was easy to understand, and within the first week, I had already earned enough to make my first withdrawal. What shocked me the most was how fast the payment came through — no delays, no runaround. I’ve now been using it for over three months, and the earnings have been consistent. It's not get-rich-quick, but it's real, and that’s what matters to me.",
  
  "💯 Before Earnbuzz, I was struggling to find a side hustle that didn’t take hours of my time. I work a full-time job, and with two kids, I don’t have much energy left at the end of the day. A friend introduced me to Earnbuzz, and I figured I had nothing to lose. Best decision I made this year. The platform is clean, easy to use, and doesn't waste your time. I earn daily without stress, and withdrawals are super fast. The extra money has helped me cover groceries, small bills, and even a birthday gift for my daughter. I’m truly grateful I found this when I did.",
  
  "🔥 At first, I didn’t believe the hype around Earnbuzz. I’ve seen too many platforms that promised the world but gave nothing. But after seeing several payment proofs and reading real user stories, I decided to try it. I started small and didn’t expect much, but I was pleasantly surprised. Within a couple of weeks, I saw steady earnings. I made my first withdrawal and it came through faster than expected. The best part? There’s real customer support. I reached out with a small issue once and got a response within hours. That’s rare these days. Earnbuzz has earned my trust.",
  
  "👏 I’ve been using Earnbuzz daily for almost a month now. It’s part of my morning routine — wake up, check earnings, complete tasks, and build up my balance. What I love most is the consistency. No tricks, no fake promises. I’ve withdrawn several times, and the process is seamless. It’s helped me slowly build up savings, especially during months where money was tight. And the referral system is a huge bonus. I invited a few friends, and we’ve all been benefiting together. It’s honestly one of the few platforms I can confidently recommend.",
  
  "✅ As someone who’s tried nearly every online side hustle — from dropshipping to surveys — Earnbuzz has been the only platform that gave me consistent results without overwhelming me. The dashboard is super user-friendly, even for someone who’s not tech-savvy. I started with zero expectations, but now it’s a key part of how I earn extra cash every week. I’ve withdrawn multiple times without a single hiccup, which says a lot. Plus, their support team is always available. It’s rare to find something that actually delivers like this.",
  
  "😎 When I first heard about Earnbuzz, I was skeptical. It sounded too good to be true, but I gave it a shot after seeing a friend post about his withdrawal. Fast forward two months, and I’m now the one sharing screenshots! I’ve earned more than I thought possible for the time I put in. The process is simple, the platform doesn’t crash or glitch, and payments arrive reliably. It’s helped me afford little things I used to stress over — like data top-ups, transport fare, and groceries. For anyone looking for legit side income, this is worth your time.",
  
  "💸 Earnbuzz came into my life at the perfect time. I had just lost a part-time job and needed a way to make ends meet. I was cautious, but the platform felt different — professional, straightforward, and actually functional. I gave it two weeks and was shocked when my first withdrawal came through instantly. Since then, I’ve been consistently earning and withdrawing every week. It’s not going to replace a full-time job, but for what it is, it works — and that peace of mind is priceless. I’m thankful for platforms like this that actually help people.",
  
  "👌 One of the things I appreciate most about Earnbuzz is how transparent everything is. From the moment you sign up, you can clearly see how things work, how much you earn, and when you can withdraw. No shady rules or sudden changes. I’ve used it for nearly 5 months now, and it’s helped me earn a reliable side income without eating up my time. I’ve even started saving up to buy a small gadget I’ve wanted for a while — something I couldn’t do before. If you’re looking for something consistent and honest, this is it.",
  
  "🙌 I started using Earnbuzz just to test it out, but now it’s a regular part of my income. I don’t have to do anything complicated — just log in, do a few things, and I get rewarded. What makes it stand out is the consistency. It doesn’t suddenly stop working or make you jump through hoops to get your money. I’ve referred a few friends too, and they’re all seeing results. Whether you’re a student, a parent, or just someone trying to make ends meet, I think Earnbuzz is genuinely worth your time.",
  
  "🤑 I’m not the type to write reviews, but Earnbuzz honestly deserves it. I’ve been burned by too many fake platforms in the past, so when I found something that actually pays, I had to speak up. It’s helped me earn on the side without investing anything upfront. The user interface is super smooth, and I’ve never had a delay with withdrawals. I even reached out to support once, and they were polite and quick to resolve my issue. That says a lot. This platform has genuinely helped me out."
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
  "🖥️ Smooth interface and quick payments make Earnbuzz a top choice.",
  "🌟 I was hesitant at first, but after using Earnbuzz for a few weeks, I’m convinced. The platform works just as promised — earn money every day and get paid quickly. It’s been great for helping me cover some small expenses, and I couldn’t be happier with how smooth everything is.",
  "💯 Earnbuzz is a total game-changer! I’ve used several platforms before, but none of them were as reliable and fast as Earnbuzz. I get paid on time, every time. It’s easy to use, and I’ve already referred a few friends who are also enjoying the rewards. A true gem!",
  "🔥 This is my go-to app now! The tasks are simple, and the rewards are real. I’ve earned more than I expected, and the withdrawals are lightning-fast. I’m finally able to make a steady side income without sacrificing too much time. Earnbuzz is legit, and I’m here to stay.",
  "👏 I love that Earnbuzz doesn’t try to scam you with complicated rules or hidden fees. It’s simple and straightforward — just complete tasks, earn, and withdraw. I’ve been using it for a while now, and I’ve had no issues with payments. I highly recommend it to anyone looking for extra cash.",
  "✅ I’ve been using Earnbuzz for over a month, and I’m thrilled with the results. The process is so easy, and the withdrawals happen instantly. I’ve made consistent earnings, and it’s helped me save up for a small vacation. I never thought I’d make money this easily online, but here I am!",
  "😎 Earnbuzz is exactly what I’ve been looking for! It’s an effortless way to earn money daily. I love how easy it is to use, and the payments are always fast. I’ve even made some extra income on days when I didn’t expect it. Definitely recommend it for anyone who needs a simple side hustle.",
  "💸 I’ve been using Earnbuzz for a couple of months, and I can’t believe how easy it is to make money. The interface is smooth, and the payments come through quickly. It’s a great platform for anyone looking to earn extra cash on the side. No gimmicks, just real earnings!",
  "👌 I was looking for a way to make a little extra money without a huge time commitment, and Earnbuzz fit the bill perfectly. The platform is user-friendly, and the tasks are simple to complete. I’ve already cashed out multiple times with no issues. Highly recommend this app for a hassle-free side hustle.",
  "🙌 What sets Earnbuzz apart is how consistent it is. I earn every day without fail, and the withdrawals happen quickly. I’ve tried other apps in the past, but none of them paid out as smoothly as Earnbuzz. It’s the perfect way to make extra cash without any headaches.",
  "🤑 I’ve been using Earnbuzz for about a month now, and I’m really impressed. The daily faucet is a nice touch, and the tasks are easy to complete. I’ve already made a few withdrawals, and they were processed instantly. This is a solid platform for anyone looking for reliable side income.",
  "💥 Earnbuzz is everything I hoped for in a side hustle. I’m making consistent money without putting in a ton of effort. The platform is easy to navigate, and the best part is the quick payouts. I’ve already recommended it to my friends, and they’re all seeing results too!",
  "📝 I was skeptical about Earnbuzz at first, but after a few weeks, I’m convinced. It’s an easy and reliable way to earn extra cash. I’ve made several withdrawals, and the process is fast and simple. The best part is the low effort required — just complete tasks and get paid!",
  "💰 I’ve been using Earnbuzz for a while now, and I couldn’t be happier with how it works. The tasks are straightforward, and the payouts are fast. I’ve been able to earn consistently without feeling overwhelmed. It’s the perfect side hustle for anyone looking for a little extra cash.",
  "🚀 Earnbuzz has exceeded my expectations. I’ve earned steady income without needing to commit a lot of time. The tasks are simple to do, and the payouts are quick. It’s been great for covering extra expenses, and I’m excited to see how much I can continue to earn with this platform.",
  "🎉 I love how Earnbuzz works. The platform is easy to use, and the payments are always on time. I’ve been able to earn enough to cover small bills and treat myself to a little extra each month. This is hands-down the best side hustle I’ve found, and I’m sticking with it.",
  "📲 The best part about Earnbuzz is how transparent everything is. You know exactly what to expect, and you can easily track your earnings. I’ve never had any issues with payments, and the tasks are simple to do. It’s been a steady source of extra income, and I couldn’t ask for more.",
  "🙌 I’ve tried several money-making platforms, but Earnbuzz is by far the best. The user interface is easy to navigate, and I love how quickly the payouts are processed. It’s helped me earn extra money without the usual frustration. If you’re looking for something reliable, this is it.",
  "⚡ I’ve been using Earnbuzz for a few months, and it’s been a steady source of extra income. The tasks are easy to complete, and the payouts are processed quickly. It’s a great way to earn on the side without a huge time commitment. Highly recommend it to anyone looking for passive income.",
  "⭐ I’m amazed at how quickly my earnings add up with Earnbuzz. The tasks are simple, and the payouts are fast. I’ve been able to earn enough to treat myself to small luxuries, and I’m grateful for the extra income. If you’re looking for a straightforward way to earn money, this is a solid choice.",
  "🖥️ Earnbuzz has been such a great find for me. I earn every day without fail, and the payouts are quick and easy. It’s been a great way to earn a little extra cash without spending hours on it. I highly recommend this platform for anyone who needs extra income without the stress."
  ];

const firstNames = [ "Chinedu", "Aisha", "Tunde", "Ngozi", "Emeka", "Fatima", "Ibrahim", "Kelechi",
    "Seyi", "Adaobi", "Bola", "Obinna", "Zainab", "Yusuf", "Amaka", "David", "Grace",
    "Uche", "Tope", "Nneka", "Samuel", "Maryam", "Gbenga", "Rashida", "Kingsley", "Temitope",
    "Hadiza", "John", "Blessing", "Peter", "Linda", "Ahmed", "Funmi", "Rita", "Abdul",
    "Chika", "Paul", "Victoria", "Halima", "Ifeanyi", "Sarah", "Joseph", "Joy", "Musa",
    "Bukky", "Stephen", "Aminat", "Henry", "Femi", "Micheal", "Modupe", "Yemisi", "Titi",
    "Chijioke", "Oluwaseun", "Durojaiye", "Fatimah", "Ademola", "Ifeoluwa", "Hassan", "Aderemi",
    "Idris", "Ekong", "Ivy", "Uko", "Eyo", "Abasiama", "Mfon", "Mbakara", "Nkechi",
    "Idorenyin", "Martha", "Ita", "Akpan", "Essien", "Obong", "Ikot", "Inyang", "Ntia",
    "Akpabio", "Etim", "Inyene", "Ndiana", "Udoh", "Akanimoh", "Udo", "Ukpong" ];
const lastNames = [ "Okoro", "Bello", "Oladipo", "Nwankwo", "Eze", "Musa", "Lawal", "Umeh", "Bakare",
    "Okafor", "Adeyemi", "Mohammed", "Onyeka", "Ibrahim", "Ogunleye", "Balogun",
    "Chukwu", "Usman", "Abiola", "Okonkwo", "Aliyu", "Ogundele", "Danladi", "Ogbonna",
    "Salami", "Olumide", "Obi", "Akinwale", "Suleiman", "Ekwueme", "Ayodele", "Garba",
    "Nwachukwu", "Anyanwu", "Yahaya", "Idowu", "Ezra", "Mustapha", "Iroko", "Ajayi",
    "Adebayo", "Ogundipe", "Nuhu", "Bamgbose", "Ikenna", "Osagie", "Akinyemi", "Chisom",
    "Oladele", "Adeleke", "Fashola", "Taiwo", "Tiwatope", "Onyebuchi", "Ikechukwu",
    "Nnaji", "Ogunbiyi", "Sule", "Muhammad", "Alabi", "Oloyede", "Etim", "Bassey",
    "Otu", "Akpabio", "Ubong" ];

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
      <body id="body" class="bg-gray-900 text-gray-200 font-sans p-6 transition-all">
        <div class="max-w-4xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
          <!-- Logo -->
          <div class="flex justify-center mb-8">
          <img src="https://raw.githubusercontent.com/glitchng/bug-free-enigma/main/earn.jpg" alt="Earnbuzz Logo" class="w-24 h-24 object-cover rounded-full mr-4" />
          </div>

          <h1 class="text-4xl font-extrabold text-center text-indigo-600 mb-8">📡 Earnbuzz Review Broadcaster</h1>
          <div class="text-center mb-6">
            <p class="text-lg ${broadcasting ? 'text-green-500' : 'text-red-500'}">Status: <b class="font-semibold">${broadcasting ? '🟢 Running' : '🔴 Stopped'}</b></p>
            <p class="mb-4 text-xl">Messages Sent: <span class="text-2xl font-bold text-gray-100">${messageCount}</span></p>
            <div class="space-x-4">
              <form method="POST" action="/start" class="inline-block">
                <button type="submit" class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all">▶️ Start Broadcasting</button>
              </form>
              <form method="POST" action="/stop" class="inline-block">
                <button type="submit" class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all">⛔ Stop Broadcasting</button>
              </form>
            </div>
          </div>
          
          <h3 class="text-2xl font-bold mb-2 text-center">Recent Logs</h3>
          <pre class="bg-gray-800 text-white p-4 rounded-md mt-4 max-h-96 overflow-y-auto">${logs.join('\n')}</pre>
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
