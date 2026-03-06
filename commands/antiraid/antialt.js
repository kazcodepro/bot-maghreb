const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('antialt')
        .setDescription('Activer ou désactiver la protection anti-comptes alternatifs')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Activer ou désactiver')
                .setRequired(true)
                .addChoices(
                    { name: 'Activer', value: 'activer' },
                    { name: 'Désactiver', value: 'désactiver' }
                ))
        .addIntegerOption(option =>
            option.setName('jours')
                .setDescription('Âge minimum du compte en jours (par défaut 7)')
                .setMinValue(1)
                .setMaxValue(365)
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 3,
    async execute(interaction, client) {
        const action = interaction.options.getString('action');
        const jours = interaction.options.getInteger('jours');
        const enabled = action === 'activer' ? 1 : 0;

        try {
            db.updateGuildSetting(interaction.guild.id, 'antialt_enabled', enabled);
            if (jours) db.updateGuildSetting(interaction.guild.id, 'antialt_days', jours);

            const details = [];
            details.push(`**Statut :** ${action === 'activer' ? '✅ Activé' : '❌ Désactivé'}`);
            if (jours) details.push(`**Âge minimum :** ${jours} jours`);

            const embed = successEmbed('Anti-alt configuré', details.join('\n'));
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            const embed = errorEmbed('Erreur', 'Une erreur est survenue lors de la modification du paramètre.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
