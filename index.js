require("dotenv").config();
const Eris = require("eris");
const keepAlive = require("./keep_alive");

const bots = [];
const delay = ms => new Promise(res => setTimeout(res, ms));

// Activity mapping
const activityMap = {
  playing: 0, play: 0,
  streaming: 1, stream: 1, live: 1,
  listening: 2, listen: 2,
  watching: 3, watch: 3,
  custom: 4,
  competing: 5, compete: 5, comp: 5
};

// Helper to parse activity type
function parseActivityType(val) {
  if (!val) return null;
  const n = Number(val);
  if (!Number.isNaN(n)) return n;
  return activityMap[String(val).trim().toLowerCase()] ?? null;
}

// Load bot configs from .env
const botConfigs = [];
for (let i = 1; i <= 3; i++) {
  const rawActivities = process.env[`ACTIVITY${i}`] || "";
  const rawTypes = process.env[`ACTIVITY_TYPE${i}`] || "";
  const rawUrls = process.env[`ACTIVITY_URL${i}`] || ""; // direct CDN URLs

  const activities = rawActivities.split(";").map(a => a.trim()).filter(a => a);
  const types = rawTypes.split(";").map(t => parseActivityType(t));
  const urls = rawUrls.split(";").map(u => u.trim());

  botConfigs.push({
    index: i,
    token: process.env[`TOKEN${i}`],
    status: process.env[`STATUS${i}`] || "online",
    activities,
    activityTypes: types,
    activityUrls: urls
  });
}

// Filter valid configs
const validConfigs = botConfigs.filter(cfg => cfg.token);
if (!validConfigs.length) {
  console.error("❌ No valid tokens found in .env (TOKEN1..TOKEN3). Exiting.");
  process.exit(1);
}

// Connect bots and set activities
(async () => {
  for (const cfg of validConfigs) {
    const idx = cfg.index;
    const bot = new Eris(cfg.token);

    const readyTimeout = setTimeout(() => {
      console.warn(`⚠️ Bot ${idx} did not become ready in 30s — disconnecting.`);
      try { bot.disconnect({ reconnect: false }); } catch {}
    }, 30_000);

    bot.on("ready", () => {
      clearTimeout(readyTimeout);
      console.log(`✅ Bot ${idx} ready as ${bot.user.username}`);

      try {
        if (cfg.activities.length) {
          const activityObjects = cfg.activities.map((act, i) => {
            const type = cfg.activityTypes[i] ?? 0;
            const url = cfg.activityUrls[i];

            const activity = type === 4 ? { type: 4, state: act } : { name: act, type };
            if (url) activity.url = url; // Add URL for image/GIF
            return activity;
          });

          bot.editStatus(cfg.status, activityObjects);
        } else {
          bot.editStatus(cfg.status);
        }
      } catch (err) {
        console.error(`❗ Failed to set activity for Bot ${idx}:`, err);
      }
    });

    bot.on("error", err => {
      console.error(`❗ Bot ${idx} error:`, err.message || err);
      if (err.message && /401|unauthorized|invalid token/i.test(err.message)) {
        console.error(`❌ Bot ${idx} has invalid token — disconnecting.`);
        try { bot.disconnect({ reconnect: false }); } catch {}
      }
    });

    bot.on("disconnect", (err, code) => {
      console.warn(`⚠️ Bot ${idx} disconnected (code ${code}):`, err || "no error");
    });

    try {
      bot.connect();
      bots.push(bot);
    } catch (e) {
      console.error(`❌ Failed to connect Bot ${idx}:`, e);
    }

    await delay(2000);
  }
})();

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("🛑 Shutting down bots...");
  bots.forEach(b => { try { b.disconnect({ reconnect: false }); } catch {} });
  process.exit(0);
});

process.on("unhandledRejection", r => console.warn("Unhandled Rejection:", r));
process.on("uncaughtException", err => console.error("Uncaught Exception:", err));
