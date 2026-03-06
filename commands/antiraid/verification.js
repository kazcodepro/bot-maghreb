const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verification')
        .setDescription('Activer ou désactiver le système de vérification')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Activer ou désactiver')
                .setRequired(true)
                .addChoices(
                    { name: 'Activer', value: 'activer' },
                    { name: 'Désactiver', value: 'désactiver' }
                ))
        .addChannelOption(option =>
            option.setName('salon')
                .setDescription('Le salon de vérification')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 3,
    async execute(interaction, client) {
        const action = interaction.options.getString('action');
        const salon = interaction.options.getChannel('salon');
        const enabled = action === 'activer' ? 1 : 0;

        if (action === 'activer' && !salon) {
            const embed = errorEmbed('Erreur', 'Vous devez spécifier un salon de vérification lors de l\'activation.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        try {
            db.updateGuildSetting(interaction.guild.id, 'verification_enabled', enabled);
            if (salon) db.updateGuildSetting(interaction.guild.id, 'verification_channel', salon.id);

            const details = [];
            details.push(`**Statut :** ${action === 'activer' ? '✅ Activé' : '❌ Désactivé'}`);
            if (salon) details.push(`**Salon :** ${salon}`);

            const embed = successEmbed('Vérification configurée', details.join('\n'));
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            const embed = errorEmbed('Erreur', 'Une erreur est survenue lors de la modification du paramètre.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
