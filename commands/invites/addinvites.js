const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addinvites')
        .setDescription('Ajouter des invitations à un utilisateur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à qui ajouter des invitations')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('nombre')
                .setDescription('Le nombre d\'invitations à ajouter')
                .setRequired(true)
                .setMinValue(1))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 3,
    async execute(interaction, client) {
        const user = interaction.options.getUser('utilisateur');
        const amount = interaction.options.getInteger('nombre');

        try {
            const data = db.getInviteData(interaction.guild.id, user.id);
            db.setInviteData(interaction.guild.id, user.id, { regular: (data.regular || 0) + amount });

            await interaction.reply({ embeds: [successEmbed(`**${amount}** invitation(s) ajoutée(s) à ${user}.`)] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue.')], ephemeral: true });
        }
    },
};
