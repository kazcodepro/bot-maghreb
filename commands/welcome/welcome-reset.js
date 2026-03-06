const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome-reset')
        .setDescription('Réinitialiser les paramètres de bienvenue par défaut')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 3,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        try {
            db.updateGuildSetting(interaction.guild.id, 'welcome_channel', null);
            db.updateGuildSetting(interaction.guild.id, 'welcome_message', 'Bienvenue {user} sur **{server}** ! Tu es le {membercount}ème membre !');
            db.updateGuildSetting(interaction.guild.id, 'welcome_enabled', 0);

            await interaction.reply({ embeds: [successEmbed('Les paramètres de bienvenue ont été réinitialisés par défaut.')] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue.')], ephemeral: true });
        }
    },
};
