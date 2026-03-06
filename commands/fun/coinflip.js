const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Lancer une pièce - Pile ou Face'),
    cooldown: 3,
    async execute(interaction, client) {
        const result = Math.random() < 0.5 ? 'Pile' : 'Face';
        const emoji = result === 'Pile' ? '🪙' : '💫';

        const embed = new EmbedBuilder()
            .setColor('#F1C40F')
            .setTitle('🪙 Pile ou Face')
            .setDescription(`La pièce tourne...\n\n${emoji} **${result}** !`)
            .setFooter({ text: `Lancé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
