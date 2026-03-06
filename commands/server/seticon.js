const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('seticon')
        .setDescription('Changer l\'icône du serveur')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('L\'URL de la nouvelle icône')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    cooldown: 10,
    async execute(interaction, client) {
        const url = interaction.options.getString('url');

        try {
            await interaction.guild.setIcon(url);
            await interaction.reply({ embeds: [successEmbed('L\'icône du serveur a été modifiée avec succès.')] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Impossible de changer l\'icône. Vérifiez que l\'URL est valide.')], ephemeral: true });
        }
    },
};
