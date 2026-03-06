const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setlang')
        .setDescription('Définir la langue du serveur')
        .addStringOption(option =>
            option.setName('langue')
                .setDescription('La langue à utiliser')
                .setRequired(true)
                .addChoices(
                    { name: 'Français', value: 'fr' },
                    { name: 'English', value: 'en' }
                ))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 5,
    async execute(interaction, client) {
        const langue = interaction.options.getString('langue');
        const langNames = { fr: 'Français', en: 'English' };

        try {
            await db.updateGuildSetting(interaction.guild.id, 'language', langue);
            await interaction.reply({ embeds: [successEmbed(`La langue du serveur a été changée en **${langNames[langue]}**.`)] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue lors du changement de langue.')], ephemeral: true });
        }
    },
};
