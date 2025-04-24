require('dotenv').config();
const Eris = require("eris");
const keep_alive = require('./keep_alive.js');

const botTokens = [
  process.env.TOKEN1,
  process.env.TOKEN2,
  process.env.TOKEN3
];

// Status indicators (online, idle, dnd, invisible)
const statuses = ["dnd", "dnd", "dnd"];

// Activity types: 0=Playing, 1=Streaming, 2=Listening, 3=Watching, 4=Custom, 5=Competing
const activityTypes = [5, 4, 0]; // should be numbers, not strings

// Activity text
const activityTexts = ["Roblox", "Sad", "Roblox"];

const bots = botTokens.map((token, index) => {
  const bot = new Eris(token);

  bot.on("error", (err) => {
    console.error(`Error with bot ${index + 1}:`, err);
  });

  bot.on("ready", () => {
    console.log(`Bot ${index + 1} is ready as ${bot.user.username}`);

    bot.editStatus(statuses[index], {
      name: activityTexts[index],
      type: activityTypes[index]
    });
  });

  bot.connect();
  return bot;
});
