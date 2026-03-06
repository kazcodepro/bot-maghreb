const { EmbedBuilder } = require('discord.js');
const db = require('../database/db');
const { replacePlaceholders } = require('../utils/functions');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        const settings = db.getGuildSettings(member.guild.id);

        if (settings.antialt_enabled) {
            const accountAge = Date.now() - member.user.createdTimestamp;
            const minAge = (settings.antialt_days || 7) * 86400000;
            if (accountAge < minAge) {
                try { await member.send(`Ton compte est trop récent pour rejoindre **${member.guild.name}**. Minimum : ${settings.antialt_days} jours.`); } catch {}
                return member.kick('Compte trop récent (anti-alt)').catch(() => {});
            }
        }

        if (settings.raidmode_enabled) {
            try { await member.send(`**${member.guild.name}** est actuellement en mode raid. Réessaie plus tard.`); } catch {}
            return member.kick('Mode raid activé').catch(() => {});
        }

        if (settings.autorole) {
            const role = member.guild.roles.cache.get(settings.autorole);
            if (role) member.roles.add(role).catch(() => {});
        }

        if (settings.welcome_enabled && settings.welcome_channel) {
            const channel = member.guild.channels.cache.get(settings.welcome_channel);
            if (channel) {
                const message = replacePlaceholders(settings.welcome_message, member, member.guild);
                const embed = new EmbedBuilder()
                    .setColor(0x57F287)
                    .setDescription(message)
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
                    .setImage(member.user.bannerURL({ dynamic: true, size: 512 }) || null)
                    .setTimestamp();
                channel.send({ content: `${member}`, embeds: [embed] }).catch(() => {});
            }
        }
    },
};
