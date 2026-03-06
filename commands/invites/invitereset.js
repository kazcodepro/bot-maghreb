const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invitereset')
        .setDescription('Réinitialiser les invitations d\'un utilisateur ou de tout le serveur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur dont vous voulez réinitialiser les invitations (vide = tout le serveur)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 5,
    async execute(interaction, client) {
        const user = interaction.options.getUser('utilisateur');

        try {
            db.resetInvites(interaction.guild.id, user ? user.id : null);

            if (user) {
                await interaction.reply({ embeds: [successEmbed(`Les invitations de ${user} ont été réinitialisées.`)] });
            } else {
                await interaction.reply({ embeds: [successEmbed('Toutes les invitations du serveur ont été réinitialisées.')] });
            }
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue lors de la réinitialisation.')], ephemeral: true });
        }
    },
};
