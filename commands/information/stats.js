const { SlashCommandBuilder, EmbedBuilder, version: djsVersion } = require('discord.js');
const config = require('../../config');
const { formatDuration } = require('../../utils/functions');
const os = require('os');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Affiche les statistiques détaillées du bot'),
    cooldown: 5,
    async execute(interaction, client) {
        const memUsage = process.memoryUsage();
        const cpuUsage = os.loadavg();
        const totalMembers = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);

        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle(`📊 Statistiques de ${client.user.username}`)
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '💾 RAM utilisée', value: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB / ${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`, inline: true },
                { name: '💾 RSS', value: `${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`, inline: true },
                { name: '💻 CPU', value: `${cpuUsage[0].toFixed(2)}% (1min)`, inline: true },
                { name: '⏱️ Uptime', value: formatDuration(client.uptime), inline: true },
                { name: '🏠 Serveurs', value: `${client.guilds.cache.size}`, inline: true },
                { name: '👥 Utilisateurs', value: `${totalMembers}`, inline: true },
                { name: '💬 Salons', value: `${client.channels.cache.size}`, inline: true },
                { name: '📋 Commandes', value: `${client.commands.size}`, inline: true },
                { name: '📦 Discord.js', value: `v${djsVersion}`, inline: true },
                { name: '🟢 Node.js', value: process.version, inline: true },
                { name: '💻 OS', value: `${os.type()} ${os.release()}`, inline: true },
                { name: '🧠 CPU Cores', value: `${os.cpus().length}`, inline: true },
            )
            .setFooter({ text: `Demandé par ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
