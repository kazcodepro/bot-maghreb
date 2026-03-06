const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave-channel')
        .setDescription('Définir le salon de départ')
        .addChannelOption(option =>
            option.setName('salon')
                .setDescription('Le salon où envoyer les messages de départ')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 3,
    async execute(interaction, client) {
        const channel = interaction.options.getChannel('salon');

        try {
            db.updateGuildSetting(interaction.guild.id, 'leave_channel', channel.id);
            await interaction.reply({ embeds: [successEmbed(`Le salon de départ a été défini sur ${channel}.`)] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue lors de la configuration.')], ephemeral: true });
        }
    },
};
