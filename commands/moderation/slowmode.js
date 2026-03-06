const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Définir le slowmode d\'un salon')
        .addIntegerOption(option =>
            option.setName('secondes')
                .setDescription('Durée du slowmode en secondes (0 pour désactiver)')
                .setMinValue(0)
                .setMaxValue(21600)
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    cooldown: 3,
    async execute(interaction, client) {
        const seconds = interaction.options.getInteger('secondes');

        try {
            await interaction.channel.setRateLimitPerUser(seconds);

            if (seconds === 0) {
                await interaction.reply({ embeds: [successEmbed('Le slowmode a été **désactivé** dans ce salon.')] });
            } else {
                await interaction.reply({ embeds: [successEmbed(`Le slowmode a été défini à **${seconds} seconde(s)**.`)] });
            }
        } catch (error) {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue lors de la modification du slowmode.')], ephemeral: true });
        }
    },
};
