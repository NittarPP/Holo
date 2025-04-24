require('dotenv').config();
const Eris = require("eris");
const fs = require("fs");

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

const status = ["dnd", "dnd", "dnd"];
const activityTypes = [2, 0, 2];
const activityTexts = ["Youtube Music", "Liminal land", "Coding"];

const bots = [];
const delay = ms => new Promise(res => setTimeout(res, ms));

(async () => {

  for (let i = 0; i < botTokens.length; i++) {
    const bot = new Eris(botTokens[i]);

    bot.on("ready", () => {
      console.log(`✅ Bot ${i + 1} is ready as ${bot.user.username}`);
      bot.editStatus(status[i], {
        name: activityTexts[i],
        type: activityTypes[i]
      });
      });
    });

    bot.on("error", (err) => {
      console.error(`❗ Error with bot ${i + 1}:`, err);
    });

    bot.on("disconnect", (err, code) => {
      console.warn(`⚠️ Bot ${i + 1} disconnected with code ${code}:`, err);
    });

    bot.connect();
    bots.push(bot);

    if (i < botTokens.length - 1) await delay(1000); // รอ 1 วินาทีก่อนเชื่อมต่อบอทถัดไป
  }
})();
