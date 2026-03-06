const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setlog')
        .setDescription('Définir le salon de logs')
        .addChannelOption(option =>
            option.setName('salon')
                .setDescription('Le salon de logs')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 5,
    async execute(interaction, client) {
        const channel = interaction.options.getChannel('salon');

        try {
            await db.updateGuildSetting(interaction.guild.id, 'log_channel', channel.id);
            await interaction.reply({ embeds: [successEmbed(`Le salon de logs a été défini sur ${channel}.`)] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue lors de la configuration.')], ephemeral: true });
        }
    },
};
