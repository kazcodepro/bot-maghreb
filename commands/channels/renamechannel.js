const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('renamechannel')
        .setDescription('Renommer un salon')
        .addChannelOption(option =>
            option.setName('salon')
                .setDescription('Le salon à renommer')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('nom')
                .setDescription('Le nouveau nom du salon')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    cooldown: 5,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const channel = interaction.options.getChannel('salon');
        const nom = interaction.options.getString('nom');
        const oldName = channel.name;

        try {
            await channel.setName(nom);
            await interaction.reply({ embeds: [successEmbed(`Le salon **${oldName}** a été renommé en **${nom}**.`)] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Impossible de renommer ce salon.')], ephemeral: true });
        }
    },
};
