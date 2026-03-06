const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed, warningEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('whitelist')
        .setDescription('Ajouter un utilisateur à la whitelist (exempt de l\'automod)')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à ajouter à la whitelist')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 3,
    async execute(interaction, client) {
        const user = interaction.options.getUser('utilisateur');

        if (user.bot) {
            const embed = warningEmbed('Attention', 'Vous ne pouvez pas ajouter un bot à la whitelist.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        try {
            const existing = db.isWhitelisted(interaction.guild.id, user.id);

            if (existing) {
                const embed = warningEmbed('Déjà whitelisté', `${user} est déjà dans la whitelist.`);
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            db.addToWhitelist(interaction.guild.id, user.id);

            const embed = successEmbed('Whitelist', `${user} a été ajouté à la whitelist avec succès.\nCet utilisateur est désormais exempt de l'automodération.`);
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            const embed = errorEmbed('Erreur', 'Une erreur est survenue lors de l\'ajout à la whitelist.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
