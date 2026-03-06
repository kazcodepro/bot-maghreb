const { SlashCommandBuilder, EmbedBuilder, version: djsVersion } = require('discord.js');
const config = require('../../config');
const { formatDuration } = require('../../utils/functions');
const os = require('os');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Affiche les informations et statistiques du bot'),
    cooldown: 5,
    async execute(interaction, client) {
        const uptime = formatDuration(client.uptime);
        const memUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const totalMembers = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
        const totalChannels = client.channels.cache.size;

        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle(`${config.emojis.info} Informations sur ${client.user.username}`)
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '⏱️ Uptime', value: uptime, inline: true },
                { name: '🏠 Serveurs', value: `${client.guilds.cache.size}`, inline: true },
                { name: '👥 Utilisateurs', value: `${totalMembers}`, inline: true },
                { name: '💬 Salons', value: `${totalChannels}`, inline: true },
                { name: '📦 Discord.js', value: `v${djsVersion}`, inline: true },
                { name: '🟢 Node.js', value: process.version, inline: true },
                { name: '💾 RAM', value: `${memUsage} MB`, inline: true },
                { name: '📋 Commandes', value: `${client.commands.size}`, inline: true },
                { name: '💻 Plateforme', value: `${os.platform()} ${os.arch()}`, inline: true },
            )
            .setFooter({ text: `ID: ${client.user.id}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
