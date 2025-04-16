require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13'); // Import selfbot client
const http = require('http');

// Logging utility
const logger = {
    info: (...args) => console.log(`[INFO] ${new Date().toISOString()}`, ...args),
    warn: (...args) => console.warn(`[WARN] ${new Date().toISOString()}`, ...args),
    error: (...args) => console.error(`[ERROR] ${new Date().toISOString()}`, ...args),
    debug: (...args) => console.debug(`[DEBUG] ${new Date().toISOString()}`, ...args)
};

// Create user client (selfbot)
const client = new Client();

// HTTP Keepalive Server
const server = http.createServer((req, res) => {
    if (req.url === '/keepalive') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('User is alive!');
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

const PORT = process.env.SERVER_PORT || 3000;
server.listen(PORT, () => {
    logger.info(`HTTP server running on port ${PORT}`);
});

// User Ready
client.once('ready', () => {
    logger.info(`Logged in as ${client.user.tag}`);
    client.user.setActivity('with code 💻', { type: 'PLAYING' }); // Set custom status
});

// Login the User (self-bot login)
client.login(process.env.TOKEN).catch((err) => {
    logger.error('Login failed:', err);
});
