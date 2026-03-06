const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unwarn')
        .setDescription('Retirer un avertissement d\'un utilisateur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur concerné')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('id')
                .setDescription('L\'ID de l\'avertissement à retirer')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    cooldown: 3,
    async execute(interaction, client) {
        const user = interaction.options.getUser('utilisateur');
        const warnId = interaction.options.getInteger('id');

        const removed = db.removeWarning(interaction.guild.id, warnId);

        if (!removed) {
            return interaction.reply({ embeds: [errorEmbed(`Avertissement #${warnId} introuvable pour **${user.tag}**.`)], ephemeral: true });
        }

        await interaction.reply({ embeds: [successEmbed(`Avertissement **#${warnId}** retiré pour **${user.tag}**.`)] });
    },
};
