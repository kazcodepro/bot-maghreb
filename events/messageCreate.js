const db = require('../database/db');
const { errorEmbed } = require('../utils/functions');
const { MessageAdapter } = require('../utils/adapter');
const { Collection } = require('discord.js');

const spamMap = new Collection();
const prefix = '+';

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;

        const settings = db.getGuildSettings(message.guild.id);

        // AFK check
        const afk = db.getAfk(message.guild.id, message.author.id);
        if (afk) {
            db.removeAfk(message.guild.id, message.author.id);
            message.reply({ embeds: [errorEmbed('Tu n\'es plus AFK !')], allowedMentions: { repliedUser: false } })
                .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000)).catch(() => {});
        }

        for (const user of message.mentions.users.values()) {
            const mentionedAfk = db.getAfk(message.guild.id, user.id);
            if (mentionedAfk) {
                message.reply({ content: `💤 **${user.username}** est AFK : ${mentionedAfk.reason}`, allowedMentions: { repliedUser: false } }).catch(() => {});
            }
        }

        // Prefix command handling
        const usedPrefix = settings.prefix || prefix;
        if (message.content.startsWith(usedPrefix)) {
            const args = message.content.slice(usedPrefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            const command = client.commands.get(commandName);
            if (!command) return;

            // Cooldown
            if (!client.cooldowns.has(commandName)) client.cooldowns.set(commandName, new Collection());
            const now = Date.now();
            const timestamps = client.cooldowns.get(commandName);
            const cooldownAmount = (command.cooldown || 3) * 1000;

            if (timestamps.has(message.author.id)) {
                const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
                if (now < expirationTime) {
                    const timeLeft = ((expirationTime - now) / 1000).toFixed(1);
                    return message.reply({ embeds: [errorEmbed(`Attends encore **${timeLeft}s** avant de réutiliser \`${usedPrefix}${commandName}\`.`)] });
                }
            }

            timestamps.set(message.author.id, now);
            setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

            // Check required args
            const cmdJson = command.data.toJSON();
            const requiredOpts = (cmdJson.options || []).filter(o => o.required);
            if (requiredOpts.length > 0 && args.length < requiredOpts.length) {
                const usage = requiredOpts.map(o => `<${o.name}>`).join(' ');
                const optionalOpts = (cmdJson.options || []).filter(o => !o.required);
                const optUsage = optionalOpts.map(o => `[${o.name}]`).join(' ');
                return message.reply({ embeds: [errorEmbed(`Utilisation : \`${usedPrefix}${commandName} ${usage}${optUsage ? ' ' + optUsage : ''}\``)] });
            }

            try {
                const adapter = new MessageAdapter(message, args, command);
                await command.execute(adapter, client);
            } catch (error) {
                console.error(`Erreur commande ${commandName}:`, error);
                message.reply({ embeds: [errorEmbed('Une erreur est survenue lors de l\'exécution de cette commande.')] }).catch(() => {});
            }

            return;
        }

        // Automod (skip whitelisted/admins)
        if (db.isWhitelisted(message.guild.id, message.author.id) || message.member.permissions.has('Administrator')) return;

        if (settings.antispam_enabled) {
            const key = `${message.guild.id}-${message.author.id}`;
            if (!spamMap.has(key)) spamMap.set(key, []);
            const timestamps = spamMap.get(key);
            timestamps.push(Date.now());
            const filtered = timestamps.filter(t => Date.now() - t < (settings.antispam_interval || 5000));
            spamMap.set(key, filtered);
            if (filtered.length >= (settings.antispam_limit || 5)) {
                spamMap.delete(key);
                await message.member.timeout(60000, 'Antispam').catch(() => {});
                message.channel.send({ content: `🛡️ ${message.author} a été mute pour spam.` }).catch(() => {});
                return;
            }
        }

        if (settings.antilink_enabled && /https?:\/\/[^\s]+/gi.test(message.content)) {
            await message.delete().catch(() => {});
            message.channel.send({ content: `🛡️ ${message.author}, les liens ne sont pas autorisés.` })
                .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000)).catch(() => {});
            return;
        }

        if (settings.antiinvite_enabled && /(discord\.gg|discord\.com\/invite)\//gi.test(message.content)) {
            await message.delete().catch(() => {});
            message.channel.send({ content: `🛡️ ${message.author}, les invitations Discord ne sont pas autorisées.` })
                .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000)).catch(() => {});
            return;
        }

        if (settings.antimention_enabled && message.mentions.users.size >= (settings.antimention_limit || 5)) {
            await message.delete().catch(() => {});
            await message.member.timeout(60000, 'Antimention').catch(() => {});
            message.channel.send({ content: `🛡️ ${message.author} a été mute pour mention de masse.` })
                .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000)).catch(() => {});
            return;
        }

        if (settings.anticaps_enabled) {
            const text = message.content.replace(/[^a-zA-Z]/g, '');
            if (text.length > 10) {
                const capsPercent = (text.replace(/[^A-Z]/g, '').length / text.length) * 100;
                if (capsPercent >= (settings.anticaps_percent || 70)) {
                    await message.delete().catch(() => {});
                    message.channel.send({ content: `🛡️ ${message.author}, trop de majuscules.` })
                        .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000)).catch(() => {});
                    return;
                }
            }
        }

        if (settings.antiflood_enabled && (message.content.length > 1000 || /(.)\1{20,}/.test(message.content))) {
            await message.delete().catch(() => {});
            message.channel.send({ content: `🛡️ ${message.author}, le flood n'est pas autorisé.` })
                .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000)).catch(() => {});
        }
    },
};
