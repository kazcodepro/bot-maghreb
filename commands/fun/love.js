const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('love')
        .setDescription('Calculer le pourcentage d\'amour entre toi et quelqu\'un')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur avec qui calculer la compatibilité')
                .setRequired(true)),
    cooldown: 3,
    async execute(interaction, client) {
        const user = interaction.options.getUser('utilisateur');
        const ids = [interaction.user.id, user.id].sort();
        let hash = 0;
        const combined = ids[0] + ids[1];
        for (let i = 0; i < combined.length; i++) {
            hash = ((hash << 5) - hash) + combined.charCodeAt(i);
            hash = hash & hash;
        }
        const percentage = Math.abs(hash) % 101;

        let comment;
        if (percentage >= 90) comment = 'C\'est le grand amour ! 💕';
        else if (percentage >= 70) comment = 'Vous êtes très compatibles ! 😍';
        else if (percentage >= 50) comment = 'Il y a du potentiel ! 😊';
        else if (percentage >= 30) comment = 'C\'est compliqué... 😅';
        else if (percentage >= 10) comment = 'Hmm, pas vraiment compatible. 😬';
        else comment = 'C\'est pas gagné... 💔';

        const bar = '█'.repeat(Math.floor(percentage / 10)) + '░'.repeat(10 - Math.floor(percentage / 10));

        const embed = new EmbedBuilder()
            .setColor('#E91E63')
            .setTitle('💘 Calculateur d\'amour')
            .setDescription(
                `**${interaction.user.username}** 💗 **${user.username}**\n\n` +
                `\`${bar}\` **${percentage}%**\n\n` +
                comment
            )
            .setFooter({ text: `Demandé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
