const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inviteconfig')
        .setDescription('Activer ou désactiver le suivi des invitations')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Activer ou désactiver le suivi')
                .setRequired(true)
                .addChoices(
                    { name: 'Activer', value: 'enable' },
                    { name: 'Désactiver', value: 'disable' }
                ))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 3,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const action = interaction.options.getString('action');

        try {
            if (action === 'enable') {
                db.updateGuildSetting(interaction.guild.id, 'invite_tracking', 1);
                await interaction.reply({ embeds: [successEmbed('Le suivi des invitations a été **activé**.')] });
            } else {
                db.updateGuildSetting(interaction.guild.id, 'invite_tracking', 0);
                await interaction.reply({ embeds: [successEmbed('Le suivi des invitations a été **désactivé**.')] });
            }
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue.')], ephemeral: true });
        }
    },
};
