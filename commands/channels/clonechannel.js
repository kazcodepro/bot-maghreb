const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clonechannel')
        .setDescription('Cloner un salon avec toutes ses permissions')
        .addChannelOption(option =>
            option.setName('salon')
                .setDescription('Le salon à cloner (salon actuel par défaut)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    cooldown: 5,
    async execute(interaction, client) {
        const channel = interaction.options.getChannel('salon') || interaction.channel;

        try {
            const cloned = await channel.clone();
            await interaction.reply({ embeds: [successEmbed(`Le salon a été cloné : ${cloned}`)] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Impossible de cloner ce salon.')], ephemeral: true });
        }
    },
};
