const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vname')
        .setDescription('Renommer le salon vocal dans lequel vous êtes')
        .addStringOption(option =>
            option.setName('nom')
                .setDescription('Le nouveau nom du salon vocal')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    cooldown: 5,
    async execute(interaction, client) {
        if (!interaction.member.voice.channel) {
            return interaction.reply({ embeds: [errorEmbed('Vous devez être dans un salon vocal.')], ephemeral: true });
        }

        const name = interaction.options.getString('nom');
        const voiceChannel = interaction.member.voice.channel;
        const oldName = voiceChannel.name;

        try {
            await voiceChannel.setName(name, `Renommé par ${interaction.user.tag}`);
            await interaction.reply({ embeds: [successEmbed(`Le salon vocal **${oldName}** a été renommé en **${name}**.`)] });
        } catch (error) {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue lors du renommage.')], ephemeral: true });
        }
    },
};
