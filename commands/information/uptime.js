const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config');
const { formatDuration } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Affiche depuis combien de temps le bot est en ligne'),
    cooldown: 3,
    async execute(interaction, client) {
        const uptime = formatDuration(client.uptime);
        const startTimestamp = Math.floor((Date.now() - client.uptime) / 1000);

        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle('⏱️ Uptime')
            .setDescription(`Le bot est en ligne depuis **${uptime}**`)
            .addFields({ name: '🕐 Démarré le', value: `<t:${startTimestamp}:F> (<t:${startTimestamp}:R>)` })
            .setFooter({ text: `Demandé par ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
