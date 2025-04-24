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
const activityTypes = [2, 0, 2];
const activityTexts = ["Youtube Music", "Liminal land", "Coding"];

const bots = [];
const delay = ms => new Promise(res => setTimeout(res, ms));

// กำหนดฐานข้อมูลคำถามและคำตอบ
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

// ฟังก์ชันตอบคำถาม
const getResponse = async (message) => {
  const lowerCaseMessage = message.toLowerCase();

  // ถ้าคำถามมีในฐานข้อมูล, ตอบคำถามนั้น
  if (qaDatabase[lowerCaseMessage]) {
    return qaDatabase[lowerCaseMessage];
  } else {
    return "I don't know the answer to that. Can you tell me the answer?";
  }
};

(async () => {
  loadDatabase(); // โหลดฐานข้อมูลเมื่อเริ่มทำงาน

  for (let i = 0; i < botTokens.length; i++) {
    const bot = new Eris(botTokens[i]);

    bot.on("ready", () => {
      console.log(`✅ Bot ${i + 1} is ready as ${bot.user.username}`);
      bot.editStatus(status[i], {
        name: activityTexts[i],
        type: activityTypes[i]
      });

      bot.on("messageCreate", (msg) => {
        if (msg.author.id !== bot.user.id) || (bot.user.id == 1362109750879453608 ) {  // ตรวจสอบว่าไม่ตอบข้อความของตัวเอง // และ กำหนดแค่บอท 13621097508794536081362109750879453608
          getResponse(msg.content).then((response) => {
            bot.createMessage(msg.channel.id, response);

            // ถ้าบอทไม่รู้คำตอบ, จะขอคำตอบจากผู้ใช้
            if (response === "I don't know the answer to that. Can you tell me the answer?") {
              bot.on("messageCreate", (responseMsg) => {
                if (responseMsg.author.id === msg.author.id) {
                  // เก็บคำตอบของผู้ใช้
                  qaDatabase[msg.content.toLowerCase()] = responseMsg.content;
                  saveDatabase();  // บันทึกฐานข้อมูล
                  bot.createMessage(msg.channel.id, "Thank you! I'll remember that answer.");
                }
              });
            }
          });
        }
      });
    });

    bot.on("error", (err) => {
      console.error(`❗ Error with bot ${i + 1}:`, err);
    });

    bot.on("disconnect", (err, code) => {
      console.warn(`⚠️ Bot ${i + 1} disconnected with code ${code}:`, err);
    });

    bot.connect();
    bots.push(bot);

    if (i < botTokens.length - 1) await delay(3000); // รอ 3 วินาทีก่อนเชื่อมต่อบอทถัดไป
  }
})();
