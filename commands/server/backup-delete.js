const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('backup-delete')
        .setDescription('Supprimer une sauvegarde')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('L\'ID de la sauvegarde à supprimer')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 5,
    async execute(interaction, client) {
        const backupId = interaction.options.getString('id');

        try {
            const backup = db.getBackup(backupId);
            if (!backup || backup.guild_id !== interaction.guild.id) {
                return interaction.reply({ embeds: [errorEmbed('Sauvegarde introuvable.')], ephemeral: true });
            }

            db.deleteBackup(backupId);
            await interaction.reply({ embeds: [successEmbed(`La sauvegarde \`${backupId}\` a été supprimée.`)] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue lors de la suppression.')], ephemeral: true });
        }
    },
};
