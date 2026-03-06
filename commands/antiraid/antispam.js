const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('antispam')
        .setDescription('Activer ou désactiver le système antispam')
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
                .setDescription('Nombre maximum de messages autorisés')
                .setMinValue(2)
                .setMaxValue(50)
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('intervalle')
                .setDescription('Intervalle en millisecondes')
                .setMinValue(1000)
                .setMaxValue(60000)
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 3,
    async execute(interaction, client) {
        const action = interaction.options.getString('action');
        const limite = interaction.options.getInteger('limite');
        const intervalle = interaction.options.getInteger('intervalle');
        const enabled = action === 'activer' ? 1 : 0;

        try {
            db.updateGuildSetting(interaction.guild.id, 'antispam_enabled', enabled);
            if (limite) db.updateGuildSetting(interaction.guild.id, 'antispam_limit', limite);
            if (intervalle) db.updateGuildSetting(interaction.guild.id, 'antispam_interval', intervalle);

            const details = [];
            details.push(`**Statut :** ${action === 'activer' ? '✅ Activé' : '❌ Désactivé'}`);
            if (limite) details.push(`**Limite :** ${limite} messages`);
            if (intervalle) details.push(`**Intervalle :** ${intervalle}ms`);

            const embed = successEmbed('Antispam configuré', details.join('\n'));
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            const embed = errorEmbed('Erreur', 'Une erreur est survenue lors de la modification du paramètre.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
