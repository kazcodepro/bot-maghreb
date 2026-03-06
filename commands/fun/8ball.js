const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const responses = [
    'Oui, absolument !',
    'Non, certainement pas.',
    'Peut-être, qui sait ?',
    'C\'est certain !',
    'Je ne pense pas.',
    'Absolument !',
    'N\'y compte pas.',
    'Sans aucun doute.',
    'Les signes pointent vers oui.',
    'Très probablement.',
    'Il vaut mieux ne pas te le dire maintenant.',
    'Je ne peux pas prédire ça.',
    'Concentre-toi et repose ta question.',
    'C\'est décidément oui.',
    'Mes sources disent non.',
    'Les perspectives sont bonnes.',
    'C\'est flou, essaie encore.',
    'Ma réponse est non.',
    'Les perspectives ne sont pas bonnes.',
    'Oui, en temps voulu.',
    'Je suis trop fatigué pour répondre.',
    'Demande-moi plus tard.',
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Pose une question à la boule magique 🎱')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('Ta question')
                .setRequired(true)),
    cooldown: 3,
    async execute(interaction, client) {
        const question = interaction.options.getString('question');
        const response = responses[Math.floor(Math.random() * responses.length)];

        const embed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle('🎱 Boule Magique')
            .addFields(
                { name: '❓ Question', value: question },
                { name: '🔮 Réponse', value: response }
            )
            .setFooter({ text: `Demandé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
