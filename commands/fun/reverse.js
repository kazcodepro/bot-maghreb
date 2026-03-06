const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reverse')
        .setDescription('Inverser un texte')
        .addStringOption(option =>
            option.setName('texte')
                .setDescription('Le texte à inverser')
                .setRequired(true)),
    cooldown: 3,
    async execute(interaction, client) {
        const texte = interaction.options.getString('texte');
        const reversed = [...texte].reverse().join('');

        const embed = new EmbedBuilder()
            .setColor('#E67E22')
            .setTitle('🔄 Texte inversé')
            .addFields(
                { name: 'Original', value: texte },
                { name: 'Inversé', value: reversed }
            )
            .setFooter({ text: `Demandé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
