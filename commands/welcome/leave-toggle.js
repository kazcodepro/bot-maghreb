const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave-toggle')
        .setDescription('Activer ou désactiver le système de départ')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 3,
    async execute(interaction, client) {
        try {
            const settings = db.getGuildSettings(interaction.guild.id);
            const newState = settings.leave_enabled ? 0 : 1;
            db.updateGuildSetting(interaction.guild.id, 'leave_enabled', newState);

            const status = newState ? '**activé**' : '**désactivé**';
            await interaction.reply({ embeds: [successEmbed(`Le système de départ a été ${status}.`)] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue.')], ephemeral: true });
        }
    },
};
