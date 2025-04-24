require('dotenv').config();
const Eris = require("eris");
const fs = require("fs");

const botTokens = [
  process.env.TOKEN1,
  process.env.TOKEN2,
  process.env.TOKEN3
].filter(Boolean); // Filter out any empty tokens

if (botTokens.length === 0) {
  console.error("❌ No valid bot tokens found. Please check your .env file.");
  process.exit(1);
}

const status = ["dnd", "dnd", "dnd"];
const activityTypes = [2, 0, 2];
const activityTexts = ["Youtube Music", "Liminal land", "Coding"];

// Database functions
const loadDatabase = () => {
  try {
    return JSON.parse(fs.readFileSync('qaDatabase.json'));
  } catch (error) {
    console.log("No existing database found, starting fresh...");
    return {};
  }
};

const saveDatabase = (db) => {
  fs.writeFileSync('qaDatabase.json', JSON.stringify(db, null, 2));
};

// Improved response handling
const handleMessage = async (bot, msg, db) => {
  if (msg.author.bot) return; // Ignore other bots
  
  const content = msg.content.toLowerCase().trim();
  
  // Check if message is in database
  if (db[content]) {
    return msg.channel.createMessage(db[content]);
  }
  
  // If not found, ask for answer
  const prompt = await msg.channel.createMessage(
    "I don't know the answer to that. Please reply with the correct answer or say 'cancel'."
  );
  
  // Wait for response
  const response = await bot.waitForMessage(
    m => m.author.id === msg.author.id && m.channel.id === msg.channel.id,
    { time: 60000, maxMatches: 1 }
  );
  
  if (!response || !response[0]) return;
  const answer = response[0].content;
  
  if (answer.toLowerCase() === 'cancel') {
    return msg.channel.createMessage("Okay, I won't learn that question.");
  }
  
  // Add to database
  db[content] = answer;
  saveDatabase(db);
  return msg.channel.createMessage("Thank you! I've learned that response.");
};

(async () => {
  const qaDatabase = loadDatabase();
  
  for (let i = 0; i < botTokens.length; i++) {
    const bot = new Eris(botTokens[i]);
    
    bot.on("ready", () => {
      console.log(`✅ Bot ${i + 1} is ready as ${bot.user.username}`);
      bot.editStatus(status[i], {
        name: activityTexts[i],
        type: activityTypes[i]
      });
    });
    
    bot.on("messageCreate", (msg) => handleMessage(bot, msg, qaDatabase));
    
    bot.on("error", (err) => {
      console.error(`❗ Error with bot ${i + 1}:`, err);
    });
    
    bot.connect();
    
    if (i < botTokens.length - 1) await new Promise(resolve => setTimeout(resolve, 3000));
  }
})();
