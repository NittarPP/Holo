require("dotenv").config();
const Eris = require("eris");
const keepAlive = require("./keep_alive");

const bots = [];
const delay = ms => new Promise(res => setTimeout(res, ms));

function parseActivityType(val) {
  if (!val) return null;
  const n = Number(val);
  if (!Number.isNaN(n)) return n;
  const map = {
    playing: 0, play: 0,
    streaming: 1, stream: 1, live: 1,
    listening: 2, listen: 2,
    watching: 3, watch: 3,
    custom: 4,
    competing: 5, compete: 5, comp: 5
  };
  return map[String(val).trim().toLowerCase()] ?? null;
}

// Build configs from ENV (adjust the upper bound if you have more tokens)
const botConfigs = [];
for (let i = 1; i <= 3; i++) {
  botConfigs.push({
    index: i,
    token: process.env[`TOKEN${i}`],
    status: process.env[`STATUS${i}`] || "online",
    activity: process.env[`ACTIVITY${i}`] || null,
    activityType: parseActivityType(process.env[`ACTIVITY_TYPE${i}`])
  });
}

// Filter out configs without tokens so missing TOKEN1 won't stop others
const validConfigs = botConfigs.filter(cfg => cfg.token);

if (validConfigs.length === 0) {
  console.error("❌ No valid tokens found in .env (TOKEN1..TOKEN3). Exiting.");
  process.exit(1);
}

(async () => {
  for (const cfg of validConfigs) {
    const idx = cfg.index;
    const bot = new Eris(cfg.token);

    // If bot isn't ready in 30s, disconnect it so it doesn't hang others
    const readyTimeout = setTimeout(() => {
      console.warn(`⚠️ Bot ${idx} did not become ready within 30s — disconnecting.`);
      try { bot.disconnect({ reconnect: false }); } catch (e) {}
    }, 30_000);

    bot.on("ready", () => {
      clearTimeout(readyTimeout);
      console.log(`✅ Bot ${idx} ready as ${bot.user.username}`);

      try {
        if (cfg.activity && cfg.activity.trim() !== "") {
          if (cfg.activityType === 4) {
            // custom status uses 'state' and must be passed as an array
            bot.editStatus(cfg.status, [{ type: 4, state: cfg.activity }]);
          } else {
            bot.editStatus(cfg.status, { name: cfg.activity, type: cfg.activityType ?? 0 });
          }
        } else {
          bot.editStatus(cfg.status);
        }
      } catch (err) {
        console.error(`❗ Failed to set status for Bot ${idx}:`, err);
      }
    });

    bot.on("error", (err) => {
      console.error(`❗ Bot ${idx} error:`, err && err.message ? err.message : err);
      // auto-disconnect on invalid token errors
      if (err && err.message && /401|unauthorized|invalid token/i.test(err.message)) {
        console.error(`❌ Bot ${idx} appears to have an invalid token — disconnecting.`);
        try { bot.disconnect({ reconnect: false }); } catch (e) {}
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

    // small delay between connects (helps with rate limits)
    await delay(2000);
  }
})();

// graceful shutdown
process.on("SIGINT", () => {
  console.log("🛑 Shutting down bots...");
  bots.forEach(b => {
    try { b.disconnect({ reconnect: false }); } catch (e) {}
  });
  process.exit(0);
});

// extra logging for unexpected issues
process.on("unhandledRejection", (r) => console.warn("Unhandled Rejection:", r));
process.on("uncaughtException", (err) => console.error("Uncaught Exception:", err));
