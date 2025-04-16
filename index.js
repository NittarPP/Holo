require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const http = require('http');

const logger = {
    info: (...args) => console.log(`[INFO] ${new Date().toISOString()}`, ...args),
    warn: (...args) => console.warn(`[WARN] ${new Date().toISOString()}`, ...args),
    error: (...args) => console.error(`[ERROR] ${new Date().toISOString()}`, ...args),
    debug: (...args) => console.debug(`[DEBUG] ${new Date().toISOString()}`, ...args)
};

// Create Discord bot client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const server = http.createServer((req, res) => {
    if (req.url === '/keepalive') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Bot is alive!');
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(process.env.SERVER_PORT, () => {
    logger.info(`HTTP server running on port ${process.env.SERVER_PORT}`);
});

client.once('ready', () => {
    logger.info(`Logged in as ${client.user.tag}`);
    client.user.setActivity('i live with code 💻', { type: 0 }); // Set custom status
});

client.login(process.env.TOKEN).catch((err) => {
    logger.error('Login failed:', err);
});
