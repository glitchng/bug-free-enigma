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
  "🔁 I love that withdrawals are processed fast. No delays, no lies. What you see is what you get.",
  "😮 I’ve tried ponzi apps that promised too much. This one is simple, and it actually delivers.",
  "🌍 I shared my link on WhatsApp groups and boom! ₦12,500 earned in 2 days. Referrals pay!",
  "📊 I now track my tap earnings like a real hustle. I even reinvested into data to refer more.",
  "💬 My friend told me about Earnbuzz and now I owe her lunch. This app really works.",
  "🏆 I topped the referral board in my area last week. Proud moment!",
  "🧠 Whoever built this, may God bless your brain. You've helped students like me a lot.",
  "💡 The design is so simple that even my grandma taps daily now.",
  "😆 I never thought making money from tapping was real until I saw ₦9k hit my wallet.",
  "🗣️ I've become an unofficial Earnbuzz ambassador. Everyone in my hostel uses it now.",
  "📦 Used my earnings to buy foodstuffs for the week. Every tap counts.",
  "🥳 It's always fun seeing my balance go up after tapping. Even better when a referral joins.",
  "📲 It doesn’t drain data like other apps. That’s a big win for me.",
  "👨‍👩‍👧 My whole family is now on Earnbuzz. Group tapping every evening 😂",
  "🎓 I used to do survey apps but they take forever. This one is direct to the point.",
  "🤓 I’ve been tracking my tap history and the math adds up. It's real, not hype.",
  "📍 I live in Jos and got paid without any issue. This is not Lagos-only.",
  "💼 I tell all my NYSC camp mates about it. They need this side cash badly.",
  "🏡 My landlord saw me tapping and now he’s on it too lol",
  "😤 Missed a full day of tapping and regretted it. It’s that addictive and rewarding.",
  "💪 I'm working toward ₦50k. With my referrals rising, I know I’ll hit it soon.",
  "🚀 This app is going viral for good reason. Simple, fast payouts, real earnings.",
  "🧾 The withdrawal receipts look clean. I use them to show proof to friends.",
  "🕐 I just tap 3–4 times a day, and I still get paid. Passive income for real.",
  "👩🏾‍💼 I introduced it to my colleagues and now we do a tap challenge during lunch breaks.",
  "🏦 Saw ₦15,000 in my Kuda account thanks to Earnbuzz. It’s not magic, it’s consistent effort.",
  "📣 If you're still doubting this app, just try it. I did, and I’m glad I did.",
  "👶 I’m saving my earnings for baby diapers. Thanks for this small but mighty source of funds.",
  "🎯 It keeps me focused daily. I wake up and tap before breakfast.",
  "📚 I paid part of my tuition with my tap + referral money. This app is saving lives.",
  "🛍️ Bought a new bag from my tap income. Who would've thought?",
  "🚪 I quit another app for this. No ads, no tricks. Just tap and cash out.",
  "🕊️ May whoever made this app never lack. You've created opportunities for us.",
  "📈 I teach my students how to earn from it legally. Tapping is now a side lesson.",
  "🎛️ Clean interface, clear goals, real money. Five stars from me.",
  "💃 My roommate and I celebrate each referral like it’s our birthday lol.",
  "🍲 I can afford 2 extra meals a day now. No more skipping lunch.",
  "🌅 Evenings are for chilling and tapping. It's like a ritual now.",
  "📞 I call all my friends who haven’t joined yet and give them my referral link immediately.",
  "🧾 The receipts look official, so I know it’s serious business.",
  "🤩 It’s crazy that tapping can make you more than some part-time jobs.","💅 Used my tap earnings for a salon session. Thank you for the soft life!",
  "📉 No stress, no losses. Unlike crypto apps, I never fear opening this one.",
  "🧱 Brick by brick, tap by tap. I’m building small wealth here.",
  "🏕️ I introduced it at a youth camp and we all signed up that day.",
  "🥳 ₦10k in a week! I couldn’t believe it. This thing is real!",
  "🍀 Lucky I found this early. It's only going to get better.",
  "🛒 I shop for small groceries now with my tap cash. It’s become part of my budget.",
  "📤 I sent money to my mum last week from my tap balance. She cried 🥹",
  "🚿 Tapping in the bathroom now. No time to waste 😆",
  "📚 I'm documenting my tap journey like a diary. Maybe I’ll blog it one day.",
  "🧭 Even in hard times, this gives direction. Thank you guys so much!",
  "🎮 I’m a gamer, and this app funds my data for streaming. Win-win.",
  "🧳 Traveled last week and still tapped daily. It works everywhere!",
  "🧽 While cleaning, I tap. While watching movies, I tap. I’m always earning!",
  "🌍 This is the most legit side hustle for Nigerians right now. Trust me.",
  "🥗 I bought my girlfriend lunch with my tap money. Now she’s tapping too 😁",
  "📱 Low-spec phones can still use it. My grandma’s itel runs it fine.",
  "🏁 Finally found an app that pays, not plays. Thank you!"
    ];

const firstNames = [
  "Chinedu", "Aisha", "Tunde", "Ngozi", "Emeka", "Fatima", "Ibrahim", "Kelechi",
  "Seyi", "Adaobi", "Bola", "Obinna", "Zainab", "Yusuf", "Amaka", "David", "Grace",
  "Uche", "Tope", "Nneka", "Samuel", "Maryam", "Gbenga", "Rashida", "Kingsley", "Temitope",
  "Hadiza", "John", "Blessing", "Peter", "Linda", "Ahmed", "Funmi", "Rita", "Abdul",
  "Chika", "Paul", "Victoria", "Halima", "Ifeanyi", "Sarah", "Joseph", "Joy", "Musa",
  "Bukky", "Stephen", "Aminat", "Henry", "Femi", "Micheal", "Modupe", "Yemisi", "Titi",
  "Chijioke", "Oluwaseun", "Durojaiye", "Fatimah", "Ademola", "Ifeoluwa", "Hassan", "Aderemi",
  "Idris", "Ekong", "Ivy", "Uko", "Eyo", "Abasiama", "Mfon", "Mbakara", "Nkechi",
  "Idorenyin", "Martha", "Ita", "Akpan", "Essien", "Obong", "Ikot", "Inyang", "Ntia",
  "Akpabio", "Etim", "Inyene", "Ndiana", "Udoh", "Akanimoh", "Udo", "Ukpong"
];

const lastNames = [
  "Okoro", "Bello", "Oladipo", "Nwankwo", "Eze", "Musa", "Lawal", "Umeh", "Bakare",
  "Okafor", "Adeyemi", "Mohammed", "Onyeka", "Ibrahim", "Ogunleye", "Balogun",
  "Chukwu", "Usman", "Abiola", "Okonkwo", "Aliyu", "Ogundele", "Danladi", "Ogbonna",
  "Salami", "Olumide", "Obi", "Akinwale", "Suleiman", "Ekwueme", "Ayodele", "Garba",
  "Nwachukwu", "Anyanwu", "Yahaya", "Idowu", "Ezra", "Mustapha", "Iroko", "Ajayi",
  "Adebayo", "Ogundipe", "Nuhu", "Bamgbose", "Ikenna", "Osagie", "Akinyemi", "Chisom",
  "Oladele", "Adeleke", "Fashola", "Taiwo", "Tiwatope", "Onyebuchi", "Ikechukwu",
  "Nnaji", "Ogunbiyi", "Sule", "Muhammad", "Alabi", "Oloyede", "Etim", "Bassey",
  "Otu", "Akpabio", "Ubong"
];

function getRandomNigerianName() {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  const maskedLast = last.slice(0, 2) + '***';
  return `${first} ${maskedLast}`;
}

function sendReviewMessage() {
  const review = reviews[Math.floor(Math.random() * reviews.length)];
  const name = getRandomNigerianName();
  const message = `👤 ${name}\n\n${review}`;
  bot.sendMessage(CHANNEL_ID, message);
  logs.push(`[${new Date().toISOString()}] ${name}`);
  messageCount++;
}

// === Telegram Bot Commands ===
bot.onText(/\/start/, (msg) => {
  if (msg.from.id === ADMIN_ID) {
    bot.sendMessage(msg.chat.id, `✅ Welcome Admin!\n\nUse /broadcast_on to start broadcasting reviews.\nUse /broadcast_off to stop.\nUse /logs to see broadcast logs.`);
  }
});

bot.onText(/\/broadcast_on/, (msg) => {
  if (msg.from.id !== ADMIN_ID) return;
  if (!broadcasting) {
    broadcasting = true;
    messageCount = 0;
    logs.length = 0;
    broadcastInterval = setInterval(sendReviewMessage, 60 * 1000); // Every 1 minute
    bot.sendMessage(msg.chat.id, `🚀 Broadcasting started! Sending reviews every 1 minute.`);
  } else {
    bot.sendMessage(msg.chat.id, `ℹ️ Broadcasting is already active.`);
  }
});

bot.onText(/\/broadcast_off/, (msg) => {
  if (msg.from.id !== ADMIN_ID) return;
  if (broadcasting) {
    broadcasting = false;
    clearInterval(broadcastInterval);
    bot.sendMessage(msg.chat.id, `🛑 Broadcasting stopped after sending ${messageCount} messages.`);
  } else {
    bot.sendMessage(msg.chat.id, `ℹ️ Broadcasting is already off.`);
  }
});

bot.onText(/\/logs/, (msg) => {
  if (msg.from.id !== ADMIN_ID) return;
  const logText = logs.length ? logs.join('\n') : 'No logs yet.';
  bot.sendMessage(msg.chat.id, `📜 Broadcast Logs:\n\n${logText}`);
});

// === Server Setup ===
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
