require('dotenv').config();
const Eris = require("eris");
const keep_alive = require('./keep_alive.js')

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

  bot.connect();

  // Set specific status based on bot index
  if (index === 1) {
    bot.editStatus("dnd");
  } else if (index === 2) {
    bot.editStatus("dnd");
  } else {
    bot.editStatus("dnd");
  }

  return bot;
});

// online
// dnd
// idle
