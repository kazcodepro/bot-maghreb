const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rate')
        .setDescription('Noter quelque chose sur 10')
        .addStringOption(option =>
            option.setName('chose')
                .setDescription('La chose à noter')
                .setRequired(true)),
    cooldown: 3,
    async execute(interaction, client) {
        const chose = interaction.options.getString('chose');
        const rating = Math.floor(Math.random() * 11);

        const stars = '⭐'.repeat(rating) + '☆'.repeat(10 - rating);

        let comment;
        if (rating >= 9) comment = 'Absolument incroyable !';
        else if (rating >= 7) comment = 'Très bien !';
        else if (rating >= 5) comment = 'Pas mal du tout.';
        else if (rating >= 3) comment = 'Bof, ça pourrait être mieux.';
        else comment = 'Hmm... non merci.';

        const embed = new EmbedBuilder()
            .setColor('#F1C40F')
            .setTitle('📊 Évaluation')
            .setDescription(
                `Je donne à **${chose}** la note de :\n\n` +
                `**${rating}/10**\n${stars}\n\n` +
                comment
            )
            .setFooter({ text: `Demandé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
