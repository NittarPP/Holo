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
const activityTypes = [2, 0, 2]; // 2: Listening, 0: Playing, 3: Streaming
const activityTexts = ["Youtube Music", "Liminal land", "Coding"];

// Load and save question-answer database
let qaDatabase = {};

const loadDatabase = () => {
  try {
    const data = fs.readFileSync('qaDatabase.json');
    qaDatabase = JSON.parse(data);
  } catch (error) {
    console.log("No existing database found, starting fresh...");
  }
};

const saveDatabase = () => {
  fs.writeFileSync('qaDatabase.json', JSON.stringify(qaDatabase, null, 2));
};

// Responding to user messages
const getResponse = async (message) => {
  const lowerCaseMessage = message.toLowerCase();
  // If the question exists in the database, return the stored answer
  if (qaDatabase[lowerCaseMessage]) {
    return qaDatabase[lowerCaseMessage];
  } else {
    return "I don't know the answer to that. Can you tell me the answer?";
  }
};

// Connecting all bots
const botInstances = [];
const delay = ms => new Promise(res => setTimeout(res, ms));

// Initialize bots
const initBots = () => {
  botTokens.forEach((token, index) => {
    const bot = new Eris(token);

    bot.on("ready", () => {
      console.log(`✅ Bot ${index + 1} is ready as ${bot.user.username}`);
      bot.editStatus(status[index], {
        name: activityTexts[index],
        type: activityTypes[index]
      });

      bot.on("messageCreate", (msg) => {
        if (msg.author.id !== bot.user.id) {  // Avoid responding to its own messages
          getResponse(msg.content).then((response) => {
            bot.createMessage(msg.channel.id, response);

            // If the bot doesn't know the answer, request the user’s answer
            if (response === "I don't know the answer to that. Can you tell me the answer?") {
              bot.on("messageCreate", (responseMsg) => {
                if (responseMsg.author.id === msg.author.id) {
                  // Save user-provided answer to the database
                  qaDatabase[msg.content.toLowerCase()] = responseMsg.content;
                  saveDatabase();  // Save the updated database
                  bot.createMessage(msg.channel.id, "Thank you! I'll remember that answer.");
                }
              });
            }
          });
        }
      });
    });

    bot.on("error", (err) => {
      console.error(`❗ Error with Bot ${index + 1}:`, err);
    });

    bot.on("disconnect", (err, code) => {
      console.warn(`⚠️ Bot ${index + 1} disconnected with code ${code}:`, err);
    });

    botInstances.push(bot);
  });
};

// Load the database and initialize bots
(async () => {
  loadDatabase(); // Load the question-answer database
  initBots(); // Initialize all bots

  // Connect each bot after a delay (to avoid rate limiting issues)
  for (const bot of botInstances) {
    await bot.connect();
    await delay(1000); // Delay to avoid hitting rate limits for multiple bot connections
  }
})();
