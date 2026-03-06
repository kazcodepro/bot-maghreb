const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('anticaps')
        .setDescription('Activer ou désactiver le système anti-majuscules')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Activer ou désactiver')
                .setRequired(true)
                .addChoices(
                    { name: 'Activer', value: 'activer' },
                    { name: 'Désactiver', value: 'désactiver' }
                ))
        .addIntegerOption(option =>
            option.setName('pourcentage')
                .setDescription('Pourcentage maximum de majuscules autorisé (par défaut 70%)')
                .setMinValue(10)
                .setMaxValue(100)
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 3,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const action = interaction.options.getString('action');
        const pourcentage = interaction.options.getInteger('pourcentage');
        const enabled = action === 'activer' ? 1 : 0;

        try {
            db.updateGuildSetting(interaction.guild.id, 'anticaps_enabled', enabled);
            if (pourcentage) db.updateGuildSetting(interaction.guild.id, 'anticaps_percent', pourcentage);

            const details = [];
            details.push(`**Statut :** ${action === 'activer' ? '✅ Activé' : '❌ Désactivé'}`);
            if (pourcentage) details.push(`**Seuil :** ${pourcentage}% de majuscules`);

            const embed = successEmbed('Anti-majuscules configuré', details.join('\n'));
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            const embed = errorEmbed('Erreur', 'Une erreur est survenue lors de la modification du paramètre.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
