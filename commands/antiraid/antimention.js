const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('antimention')
        .setDescription('Activer ou désactiver le système anti-mention de masse')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Activer ou désactiver')
                .setRequired(true)
                .addChoices(
                    { name: 'Activer', value: 'activer' },
                    { name: 'Désactiver', value: 'désactiver' }
                ))
        .addIntegerOption(option =>
            option.setName('limite')
                .setDescription('Nombre maximum de mentions autorisées par message')
                .setMinValue(1)
                .setMaxValue(50)
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 3,
    async execute(interaction, client) {
        const action = interaction.options.getString('action');
        const limite = interaction.options.getInteger('limite');
        const enabled = action === 'activer' ? 1 : 0;

        try {
            db.updateGuildSetting(interaction.guild.id, 'antimention_enabled', enabled);
            if (limite) db.updateGuildSetting(interaction.guild.id, 'antimention_limit', limite);

            const details = [];
            details.push(`**Statut :** ${action === 'activer' ? '✅ Activé' : '❌ Désactivé'}`);
            if (limite) details.push(`**Limite :** ${limite} mentions par message`);

            const embed = successEmbed('Anti-mention configuré', details.join('\n'));
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            const embed = errorEmbed('Erreur', 'Une erreur est survenue lors de la modification du paramètre.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
