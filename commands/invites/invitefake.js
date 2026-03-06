const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invitefake')
        .setDescription('Définir le nombre de fausses invitations d\'un utilisateur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur ciblé')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('nombre')
                .setDescription('Le nombre de fausses invitations')
                .setRequired(true)
                .setMinValue(0))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 3,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const user = interaction.options.getUser('utilisateur');
        const amount = interaction.options.getInteger('nombre');

        try {
            db.setInviteData(interaction.guild.id, user.id, { fake: amount });
            await interaction.reply({ embeds: [successEmbed(`Les fausses invitations de ${user} ont été définies à **${amount}**.`)] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue.')], ephemeral: true });
        }
    },
};
