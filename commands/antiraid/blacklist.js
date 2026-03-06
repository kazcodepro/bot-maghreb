const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed, warningEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blacklist')
        .setDescription('Ajouter un utilisateur à la blacklist (ban automatique à l\'arrivée)')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à blacklister')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('Raison de la blacklist')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 3,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const user = interaction.options.getUser('utilisateur');
        const raison = interaction.options.getString('raison') || 'Aucune raison spécifiée';

        if (user.id === interaction.user.id) {
            const embed = warningEmbed('Attention', 'Vous ne pouvez pas vous blacklister vous-même.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        try {
            const existing = db.isBlacklisted(interaction.guild.id, user.id);

            if (existing) {
                const embed = warningEmbed('Déjà blacklisté', `${user} est déjà dans la blacklist.`);
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            db.addToBlacklist(interaction.guild.id, user.id, raison);

            const embed = successEmbed('Blacklist', `${user} a été ajouté à la blacklist.\n**Raison :** ${raison}\n\nCet utilisateur sera automatiquement banni s'il rejoint le serveur.`);
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            const embed = errorEmbed('Erreur', 'Une erreur est survenue lors de l\'ajout à la blacklist.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
