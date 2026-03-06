const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setbanner')
        .setDescription('Changer la bannière du serveur')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('L\'URL de la nouvelle bannière')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    cooldown: 10,
    async execute(interaction, client) {
        const url = interaction.options.getString('url');

        try {
            await interaction.guild.setBanner(url);
            await interaction.reply({ embeds: [successEmbed('La bannière du serveur a été modifiée avec succès.')] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Impossible de changer la bannière. Le serveur doit avoir le niveau de boost requis et l\'URL doit être valide.')], ephemeral: true });
        }
    },
};
