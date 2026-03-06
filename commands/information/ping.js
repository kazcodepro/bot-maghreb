const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Affiche la latence du bot et de l\'API'),
    cooldown: 3,
    async execute(interaction, client) {
        const sent = await interaction.reply({ content: '🏓 Calcul du ping...', fetchReply: true });
        const roundtrip = sent.createdTimestamp - interaction.createdTimestamp;
        const wsLatency = client.ws.ping;

        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle('🏓 Pong !')
            .addFields(
                { name: '📡 Latence du bot', value: `\`${roundtrip}ms\``, inline: true },
                { name: '💓 Latence API', value: `\`${wsLatency}ms\``, inline: true },
            )
            .setFooter({ text: `Demandé par ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.editReply({ content: null, embeds: [embed] });
    },
};
