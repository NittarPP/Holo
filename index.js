require('dotenv').config();
console.log("Token:", process.env.TOKEN);
const Eris = require("eris");

// Make sure you're referencing process.env.TOKEN (all uppercase)
const bot = new Eris(process.env.TOKEN);

bot.on("error", (err) => {
  console.error(err);
});

bot.connect();
