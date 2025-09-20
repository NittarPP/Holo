require("dotenv").config();
const Eris = require("eris");
const keepAlive = require("./keep_alive");

const bots = [];
const delay = ms => new Promise(res => setTimeout(res, ms));

const botConfigs = [
  {
    token: process.env.TOKEN1,
    status: process.env.STATUS1 || "online",
    activity: process.env.ACTIVITY1 || null,
    activityType: parseInt(process.env.ACTIVITY_TYPE1) || null
  },
  {
    token: process.env.TOKEN2,
    status: process.env.STATUS2 || "online",
    activity: process.env.ACTIVITY2 || null,
    activityType: parseInt(process.env.ACTIVITY_TYPE2) || null
  },
  {
    token: process.env.TOKEN3,
    status: process.env.STATUS3 || "online",
    activity: process.env.ACTIVITY3 || null,
    activityType: parseInt(process.env.ACTIVITY_TYPE3) || null
  }
];

(async () => {
  for (let i = 0; i < botConfigs.length; i++) {
    const cfg = botConfigs[i];
    if (!cfg.token) {
      console.warn(`⚠️ Skipping Bot ${i + 1}: missing token`);
      continue;
    }

    const bot = new Eris(cfg.token);

    bot.on("ready", () => {
      console.log(`✅ Bot ${i + 1} ready as ${bot.user.username}`);

      if (cfg.activity && cfg.activity.trim() !== "") {
        if (cfg.activityType === 4) {
          // Custom Status
          bot.editStatus(cfg.status, [
            {
              type: 4,
              state: cfg.activity // must use state instead of name
            }
          ]);
        } else {
          // Normal activities (Playing, Listening, Watching, etc.)
          bot.editStatus(cfg.status, {
            name: cfg.activity,
            type: cfg.activityType ?? 0
          });
        }
      } else {
        bot.editStatus(cfg.status);
      }
    });

    bot.on("error", err => console.error(`❗ Bot ${i + 1} error:`, err));
    bot.on("disconnect", (err, code) =>
      console.warn(`⚠️ Bot ${i + 1} disconnected (code ${code}):`, err)
    );

    bot.connect();
    bots.push(bot);

    if (i < botConfigs.length - 1) await delay(2000);
  }
})();

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("🛑 Shutting down bots...");
  bots.forEach(bot => bot.disconnect({ reconnect: false }));
  process.exit(0);
});
