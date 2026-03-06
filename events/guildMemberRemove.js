const { EmbedBuilder } = require('discord.js');
const db = require('../database/db');
const { replacePlaceholders } = require('../utils/functions');

module.exports = {
    name: 'guildMemberRemove',
    async execute(member) {
        const settings = db.getGuildSettings(member.guild.id);

        if (settings.leave_enabled && settings.leave_channel) {
            const channel = member.guild.channels.cache.get(settings.leave_channel);
            if (channel) {
                const message = replacePlaceholders(settings.leave_message, member, member.guild);
                const embed = new EmbedBuilder()
                    .setColor(0xED4245)
                    .setTitle('👋 Au revoir...')
                    .setDescription(message)
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
                    .setFooter({ text: `Nous sommes maintenant ${member.guild.memberCount} membres` })
                    .setTimestamp();
                channel.send({ embeds: [embed] }).catch(() => {});
            }
        }
    },
};
