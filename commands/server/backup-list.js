const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('backup-list')
        .setDescription('Lister toutes les sauvegardes du serveur')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 5,
    async execute(interaction, client) {
        try {
            const rows = db.getBackupList(interaction.guild.id);

            if (!rows || rows.length === 0) {
                return interaction.reply({ embeds: [errorEmbed('Aucune sauvegarde trouvée pour ce serveur.')], ephemeral: true });
            }

            const list = rows.map((row, i) => {
                return `**${i + 1}.** \`${row.backup_id || row.id}\` — <t:${Math.floor((row.created_at || row.createdAt) / 1000)}:f> — par <@${row.user_id || row.userId}>`;
            }).join('\n');

            const embed = new EmbedBuilder()
                .setTitle('💾 Sauvegardes du serveur')
                .setDescription(list)
                .setColor('#5865F2')
                .setFooter({ text: `${rows.length} sauvegarde(s)` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue.')], ephemeral: true });
        }
    },
};
