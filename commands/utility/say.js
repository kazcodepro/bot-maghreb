const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Faire parler le bot dans un salon')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Le message à envoyer')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('salon')
                .setDescription('Le salon où envoyer le message')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    cooldown: 3,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const message = interaction.options.getString('message');
        const channel = interaction.options.getChannel('salon') || interaction.channel;

        try {
            await channel.send(message);
            await interaction.reply({ embeds: [successEmbed(`Message envoyé dans ${channel}.`)], ephemeral: true });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Impossible d\'envoyer le message dans ce salon.')], ephemeral: true });
        }
    },
};
