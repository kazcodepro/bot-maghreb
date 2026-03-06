const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nsfw')
        .setDescription('Activer/désactiver le mode NSFW d\'un salon')
        .addChannelOption(option =>
            option.setName('salon')
                .setDescription('Le salon à modifier (salon actuel par défaut)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    cooldown: 5,
    async execute(interaction, client) {
        const channel = interaction.options.getChannel('salon') || interaction.channel;

        try {
            const newState = !channel.nsfw;
            await channel.setNSFW(newState);
            const status = newState ? 'activé' : 'désactivé';
            await interaction.reply({ embeds: [successEmbed(`Le mode NSFW a été **${status}** pour ${channel}.`)] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Impossible de modifier le mode NSFW de ce salon.')], ephemeral: true });
        }
    },
};
