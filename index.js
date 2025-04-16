require('dotenv').config();
const Eris = require("eris");
const keep_alive = require('./keep_alive.js');

const botTokens = [
  process.env.TOKEN1,
  process.env.TOKEN2,
  process.env.TOKEN3
];

const bots = botTokens.map((token, index) => {
  const bot = new Eris(token);

  bot.on("error", (err) => {
    console.error(`Error with bot${index + 1}:`, err);
  });

  bot.on("ready", () => {
    console.log(`Bot ${index + 1} is ready as ${bot.user.username}`);

    if (index === 1) {
      bot.editStatus("dnd");
    } else if (index === 2) {
      bot.editStatus("idle");
    } else if (index === 3) {
      bot.editStatus("dnd");
    } else {
      bot.editStatus("online");
    }
  });

  bot.connect();
  return bot;
});


// online
// dnd
// idle
