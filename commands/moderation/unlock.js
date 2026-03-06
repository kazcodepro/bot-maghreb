const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../config');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Déverrouiller un salon')
        .addChannelOption(option =>
            option.setName('salon')
                .setDescription('Le salon à déverrouiller')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('La raison du déverrouillage')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    cooldown: 3,
    async execute(interaction, client) {
        const channel = interaction.options.getChannel('salon') || interaction.channel;
        const reason = interaction.options.getString('raison') || 'Aucune raison';

        try {
            await channel.permissionOverwrites.edit(interaction.guild.id, {
                SendMessages: null,
            });

            await interaction.reply({ embeds: [successEmbed(`${config.emojis.unlock} Le salon ${channel} a été **déverrouillé**.\n**Raison :** ${reason}`)] });
        } catch (error) {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue lors du déverrouillage.')], ephemeral: true });
        }
    },
};
