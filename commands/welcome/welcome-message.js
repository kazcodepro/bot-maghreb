const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed, infoEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome-message')
        .setDescription('Définir le message de bienvenue personnalisé')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Le message de bienvenue ({user}, {username}, {tag}, {server}, {membercount}, {id})')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 3,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const message = interaction.options.getString('message');

        try {
            db.updateGuildSetting(interaction.guild.id, 'welcome_message', message);

            const preview = message
                .replace(/{user}/g, interaction.user)
                .replace(/{username}/g, interaction.user.username)
                .replace(/{tag}/g, interaction.user.tag)
                .replace(/{server}/g, interaction.guild.name)
                .replace(/{membercount}/g, interaction.guild.memberCount)
                .replace(/{id}/g, interaction.user.id);

            await interaction.reply({ embeds: [
                successEmbed(`Le message de bienvenue a été mis à jour.`),
                infoEmbed(`**Aperçu :**\n${preview}`)
            ] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue.')], ephemeral: true });
        }
    },
};
