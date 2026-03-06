const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome-channel')
        .setDescription('Définir le salon de bienvenue')
        .addChannelOption(option =>
            option.setName('salon')
                .setDescription('Le salon où envoyer les messages de bienvenue')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 3,
    async execute(interaction, client) {
        const channel = interaction.options.getChannel('salon');

        try {
            db.updateGuildSetting(interaction.guild.id, 'welcome_channel', channel.id);
            await interaction.reply({ embeds: [successEmbed(`Le salon de bienvenue a été défini sur ${channel}.`)] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue lors de la configuration.')], ephemeral: true });
        }
    },
};
