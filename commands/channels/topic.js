const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('topic')
        .setDescription('Définir le sujet d\'un salon')
        .addStringOption(option =>
            option.setName('sujet')
                .setDescription('Le nouveau sujet du salon')
                .setRequired(true)
                .setMaxLength(1024))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    cooldown: 5,
    async execute(interaction, client) {
        try {
            await interaction.channel.setTopic(interaction.options.getString('sujet'));
            await interaction.reply({ embeds: [successEmbed(`Le sujet du salon a été mis à jour.`)] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Impossible de modifier le sujet de ce salon.')], ephemeral: true });
        }
    },
};
