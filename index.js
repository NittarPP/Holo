require('dotenv').config();
const Eris = require("eris");
const keep_alive = require('./keep_alive.js');

const botTokens = [
  process.env.TOKEN1,
  process.env.TOKEN2,
  process.env.TOKEN3
];

// Validate tokens
if (botTokens.some(token => !token)) {
  console.error("❌ One or more bot tokens are missing. Please check your .env file.");
  process.exit(1);
}

// Status indicators (online, idle, dnd, invisible)
const statuses = ["dnd", "dnd", "dnd"];

// Activity types: 0=Playing 🎮, 1=Streaming 📹, 2=Listening 🎧, 3=Watching 📺, 4=Custom 🧙‍♂️, 5=Competing 🏆
const activityTypes = [2, 0, 2];

// Activity text
const activityTexts = ["Youtube Music", "Liminal land", "Coding"];

const bots = [];

const delay = ms => new Promise(res => setTimeout(res, ms));

(async () => {
  for (let i = 0; i < botTokens.length; i++) {
    const bot = new Eris(botTokens[i]);

    bot.on("ready", () => {
      console.log(`✅ Bot ${i + 1} is ready as ${bot.user.username}`);
      bot.editStatus(statuses[i], {
        name: activityTexts[i],
        type: activityTypes[i]
      });
    });

    bot.on("error", (err) => {
      console.error(`❗ Error with bot ${i + 1}:`, err);
    });

    bot.on("disconnect", (err, code) => {
      console.warn(`⚠️ Bot ${i + 1} disconnected with code ${code}:`, err);
    });

    bot.on("messageCreate", (msg) => {
    if(msg.content === "Hello") {
      bot.createMessage(msg.channel.id, "Hi");
    }
  });

    bot.connect();
    bots.push(bot);

    if (i < botTokens.length - 1) await delay(3000); // Wait 3 seconds before connecting the next bot
  }
})();
