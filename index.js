require('dotenv').config();
const http = require('http');
const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const { loadCommands } = require('./handlers/commands');
const { loadEvents } = require('./handlers/events');
const db = require('./database/db');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.GuildMember,
    ],
});

client.commands = new Collection();
client.cooldowns = new Collection();
client.snipes = new Collection();
client.editSnipes = new Collection();

loadCommands(client);
loadEvents(client);

setInterval(() => {
    const now = Date.now();

    const expiredBans = db.getExpiredTempBans(now);
    for (const ban of expiredBans) {
        const guild = client.guilds.cache.get(ban.guild_id);
        if (guild) guild.members.unban(ban.user_id, 'Tempban expiré').catch(() => {});
        db.removeTempBan(ban.guild_id, ban.user_id);
    }

    const expiredMutes = db.getExpiredTempMutes(now);
    for (const mute of expiredMutes) {
        const guild = client.guilds.cache.get(mute.guild_id);
        if (guild) {
            const member = guild.members.cache.get(mute.user_id);
            if (member) member.timeout(null, 'Tempmute expiré').catch(() => {});
        }
        db.removeTempMute(mute.guild_id, mute.user_id);
    }

    const expiredReminders = db.getExpiredReminders(now);
    for (const reminder of expiredReminders) {
        const channel = client.channels.cache.get(reminder.channel_id);
        if (channel) channel.send(`<@${reminder.user_id}> ⏰ Rappel : ${reminder.message}`).catch(() => {});
        db.removeReminder(reminder.id);
    }

    const activeGiveaways = db.getExpiredGiveaways(now);
    for (const giveaway of activeGiveaways) {
        const channel = client.channels.cache.get(giveaway.channel_id);
        if (channel) {
            const participants = giveaway.participants || [];
            const winners = [];
            const pool = [...participants];
            for (let i = 0; i < giveaway.winners_count && pool.length > 0; i++) {
                const idx = Math.floor(Math.random() * pool.length);
                winners.push(pool.splice(idx, 1)[0]);
            }
            const winnerMentions = winners.map(id => `<@${id}>`).join(', ') || 'Aucun participant';
            channel.send(`🎉 **GIVEAWAY TERMINÉ** 🎉\nPrix: **${giveaway.prize}**\nGagnant(s): ${winnerMentions}`).catch(() => {});
        }
        db.updateGiveaway(giveaway.id, { ended: 1 });
    }
}, 10000);

// --- Health check HTTP server pour Render ---
const PORT = process.env.PORT || 3000;
const startTime = Date.now();

const server = http.createServer((req, res) => {
    const uptime = Date.now() - startTime;
    const hours = Math.floor(uptime / 3600000);
    const minutes = Math.floor((uptime % 3600000) / 60000);
    const seconds = Math.floor((uptime % 60000) / 1000);

    if (req.url === '/health' || req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            bot: client.user?.tag || 'Démarrage...',
            uptime: `${hours}h ${minutes}m ${seconds}s`,
            guilds: client.guilds?.cache.size || 0,
            users: client.users?.cache.size || 0,
            commands: client.commands?.size || 0,
            ping: client.ws?.ping || 0,
            memory: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
        }));
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`🌐 Serveur health check démarré sur le port ${PORT}`);
});

client.login(process.env.TOKEN);
