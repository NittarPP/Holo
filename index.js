const Eris = require("eris");
const keep_alive = require('./keep_alive.js')

const bot1 = new Eris(process.env.TOKEN1);
const bot2 = new Eris(process.env.TOKEN2);

bot1.on("error", (err) => {
  console.error(err);
});

bot2.on("error", (err) => {
  console.error(err);
});

bot1.connect();
bot2.connect();
