const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inviteleaderboard')
        .setDescription('Voir le classement des meilleurs inviteurs'),
    cooldown: 5,
    async execute(interaction, client) {
        const settings = db.getGuildSettings(interaction.guild.id);
        if (!settings.invite_tracking) {
            return interaction.reply({ embeds: [errorEmbed('Le système d\'invitations n\'est pas activé sur ce serveur.')], ephemeral: true });
        }

        const rows = db.getInviteLeaderboard(interaction.guild.id);

        if (!rows.length) {
            return interaction.reply({ embeds: [errorEmbed('Aucune donnée d\'invitation trouvée.')], ephemeral: true });
        }

        const leaderboard = rows.map((row, i) => {
            const total = row.regular - row.fake - row.leaves;
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `**${i + 1}.**`;
            return `${medal} <@${row.user_id}> — **${total}** invitation(s) (${row.regular} régulières, ${row.fake} fausses, ${row.leaves} parties)`;
        }).join('\n');

        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle(`${config.emojis.crown} Classement des invitations`)
            .setDescription(leaderboard)
            .setFooter({ text: `Demandé par ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
