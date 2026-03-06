const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vlimit')
        .setDescription('Définir la limite d\'utilisateurs dans un salon vocal')
        .addIntegerOption(option =>
            option.setName('nombre')
                .setDescription('Limite d\'utilisateurs (0 pour illimité)')
                .setMinValue(0)
                .setMaxValue(99)
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    cooldown: 3,
    async execute(interaction, client) {
        if (!interaction.member.voice.channel) {
            return interaction.reply({ embeds: [errorEmbed('Vous devez être dans un salon vocal.')], ephemeral: true });
        }

        const limit = interaction.options.getInteger('nombre');
        const voiceChannel = interaction.member.voice.channel;

        try {
            await voiceChannel.setUserLimit(limit);

            if (limit === 0) {
                await interaction.reply({ embeds: [successEmbed(`La limite d'utilisateurs de ${voiceChannel} a été **supprimée**.`)] });
            } else {
                await interaction.reply({ embeds: [successEmbed(`La limite d'utilisateurs de ${voiceChannel} a été définie à **${limit}**.`)] });
            }
        } catch (error) {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue lors de la modification de la limite.')], ephemeral: true });
        }
    },
};
