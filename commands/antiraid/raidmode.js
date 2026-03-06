const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('raidmode')
        .setDescription('Activer ou désactiver le mode raid (expulse tous les nouveaux membres)')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Activer ou désactiver')
                .setRequired(true)
                .addChoices(
                    { name: 'Activer', value: 'activer' },
                    { name: 'Désactiver', value: 'désactiver' }
                ))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 3,
    async execute(interaction, client) {
        const action = interaction.options.getString('action');
        const enabled = action === 'activer' ? 1 : 0;

        try {
            db.updateGuildSetting(interaction.guild.id, 'raidmode_enabled', enabled);

            const embed = successEmbed(
                `Mode Raid ${action === 'activer' ? 'activé' : 'désactivé'}`,
                action === 'activer'
                    ? '⚠️ **Le mode raid est maintenant activé.**\nTous les nouveaux membres seront automatiquement expulsés.\nN\'oubliez pas de le désactiver une fois le raid terminé.'
                    : 'Le mode raid a été désactivé. Les nouveaux membres peuvent à nouveau rejoindre le serveur.'
            );
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            const embed = errorEmbed('Erreur', 'Une erreur est survenue lors de la modification du paramètre.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
