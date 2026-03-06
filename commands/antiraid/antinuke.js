const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('antinuke')
        .setDescription('Activer ou désactiver la protection antinuke')
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
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const action = interaction.options.getString('action');
        const enabled = action === 'activer' ? 1 : 0;

        try {
            db.updateGuildSetting(interaction.guild.id, 'antinuke_enabled', enabled);

            const embed = successEmbed(
                `Antinuke ${action === 'activer' ? 'activé' : 'désactivé'}`,
                `La protection antinuke a été **${action === 'activer' ? 'activée' : 'désactivée'}** avec succès.\n${action === 'activer' ? 'Les actions destructrices (suppression de salons, de rôles, bans massifs) seront détectées et bloquées.' : ''}`
            );
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            const embed = errorEmbed('Erreur', 'Une erreur est survenue lors de la modification du paramètre.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
