const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-panel')
        .setDescription('Envoyer un panneau de création de tickets')
        .addChannelOption(option =>
            option.setName('salon')
                .setDescription('Le salon où envoyer le panneau')
                .setRequired(false)
                .addChannelTypes(ChannelType.GuildText))
        .addStringOption(option =>
            option.setName('titre')
                .setDescription('Le titre du panneau')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('La description du panneau')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 5,
    async execute(interaction, client) {
        const channel = interaction.options.getChannel('salon') || interaction.channel;
        const title = interaction.options.getString('titre') || `${config.emojis.ticket} Système de Tickets`;
        const description = interaction.options.getString('description') || 'Cliquez sur le bouton ci-dessous pour créer un ticket.\nUn membre du support vous répondra dès que possible.';

        try {
            const embed = new EmbedBuilder()
                .setColor(config.colors.primary)
                .setTitle(title)
                .setDescription(description)
                .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_create')
                    .setLabel('Créer un ticket')
                    .setEmoji('🎫')
                    .setStyle(ButtonStyle.Primary)
            );

            await channel.send({ embeds: [embed], components: [row] });
            await interaction.reply({ embeds: [successEmbed(`Le panneau de tickets a été envoyé dans ${channel}.`)], ephemeral: true });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue lors de l\'envoi du panneau.')], ephemeral: true });
        }
    },
};
