const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ship')
        .setDescription('Shipper deux utilisateurs ensemble 💕')
        .addUserOption(option =>
            option.setName('utilisateur1')
                .setDescription('Le premier utilisateur')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('utilisateur2')
                .setDescription('Le deuxième utilisateur')
                .setRequired(true)),
    cooldown: 3,
    async execute(interaction, client) {
        const user1 = interaction.options.getUser('utilisateur1');
        const user2 = interaction.options.getUser('utilisateur2');

        const ids = [user1.id, user2.id].sort();
        let hash = 0;
        const combined = ids[0] + ids[1];
        for (let i = 0; i < combined.length; i++) {
            hash = ((hash << 5) - hash) + combined.charCodeAt(i);
            hash = hash & hash;
        }
        const percentage = Math.abs(hash) % 101;

        const filled = Math.floor(percentage / 5);
        const empty = 20 - filled;
        const bar = '█'.repeat(filled) + '░'.repeat(empty);

        let emoji, comment;
        if (percentage >= 90) { emoji = '💖'; comment = 'Le couple parfait !'; }
        else if (percentage >= 70) { emoji = '💗'; comment = 'Très bonne compatibilité !'; }
        else if (percentage >= 50) { emoji = '💛'; comment = 'Il y a du potentiel !'; }
        else if (percentage >= 30) { emoji = '🧡'; comment = 'Hmm, peut-être avec du temps...'; }
        else if (percentage >= 10) { emoji = '💙'; comment = 'Pas vraiment compatible...'; }
        else { emoji = '💔'; comment = 'Ce n\'est pas pour cette vie...'; }

        const shipName = user1.username.slice(0, Math.ceil(user1.username.length / 2)) +
            user2.username.slice(Math.floor(user2.username.length / 2));

        const embed = new EmbedBuilder()
            .setColor('#FF69B4')
            .setTitle(`${emoji} Ship : ${shipName}`)
            .setDescription(
                `**${user1.username}** x **${user2.username}**\n\n` +
                `\`${bar}\` **${percentage}%**\n\n` +
                comment
            )
            .setFooter({ text: `Demandé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
