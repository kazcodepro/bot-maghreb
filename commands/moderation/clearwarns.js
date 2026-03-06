const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearwarns')
        .setDescription('Supprimer tous les avertissements d\'un utilisateur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur dont supprimer les avertissements')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    cooldown: 3,
    async execute(interaction, client) {
        const user = interaction.options.getUser('utilisateur');

        const count = db.getWarnings(interaction.guild.id, user.id).length;

        if (count === 0) {
            return interaction.reply({ embeds: [errorEmbed(`**${user.tag}** n'a aucun avertissement.`)], ephemeral: true });
        }

        db.clearWarnings(interaction.guild.id, user.id);

        await interaction.reply({ embeds: [successEmbed(`**${count}** avertissement(s) supprimé(s) pour **${user.tag}**.`)] });
    },
};
