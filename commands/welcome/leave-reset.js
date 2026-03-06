const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave-reset')
        .setDescription('Réinitialiser les paramètres de départ par défaut')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 3,
    async execute(interaction, client) {
        try {
            db.updateGuildSetting(interaction.guild.id, 'leave_channel', null);
            db.updateGuildSetting(interaction.guild.id, 'leave_message', '{user} a quitté **{server}**. Nous sommes maintenant {membercount} membres.');
            db.updateGuildSetting(interaction.guild.id, 'leave_enabled', 0);

            await interaction.reply({ embeds: [successEmbed('Les paramètres de départ ont été réinitialisés par défaut.')] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue.')], ephemeral: true });
        }
    },
};
