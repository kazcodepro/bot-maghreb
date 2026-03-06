const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autorole-remove')
        .setDescription('Supprimer le rôle automatique')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 5,
    async execute(interaction, client) {
        try {
            await db.updateGuildSetting(interaction.guild.id, 'autorole', null);
            await interaction.reply({ embeds: [successEmbed('Le rôle automatique a été supprimé.')] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue lors de la suppression.')], ephemeral: true });
        }
    },
};
