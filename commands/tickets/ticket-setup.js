const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-setup')
        .setDescription('Configurer le système de tickets')
        .addChannelOption(option =>
            option.setName('salon')
                .setDescription('Le salon où envoyer le panneau de tickets')
                .setRequired(false)
                .addChannelTypes(ChannelType.GuildText))
        .addChannelOption(option =>
            option.setName('catégorie')
                .setDescription('La catégorie où créer les tickets')
                .setRequired(false)
                .addChannelTypes(ChannelType.GuildCategory))
        .addRoleOption(option =>
            option.setName('rôle_support')
                .setDescription('Le rôle du support')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 5,
    async execute(interaction, client) {
        const channel = interaction.options.getChannel('salon') || interaction.channel;
        const category = interaction.options.getChannel('catégorie');
        const supportRole = interaction.options.getRole('rôle_support');

        try {
            if (category) db.updateGuildSetting(interaction.guild.id, 'ticket_category', category.id);
            if (supportRole) db.updateGuildSetting(interaction.guild.id, 'ticket_support_role', supportRole.id);
            db.updateGuildSetting(interaction.guild.id, 'ticket_log_channel', channel.id);

            const embed = new EmbedBuilder()
                .setColor(config.colors.primary)
                .setTitle(`${config.emojis.ticket} Système de Tickets`)
                .setDescription('Cliquez sur le bouton ci-dessous pour créer un ticket.\nUn membre du support vous répondra dès que possible.')
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
            await interaction.reply({ embeds: [successEmbed(`Le système de tickets a été configuré dans ${channel}.`)], ephemeral: true });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue lors de la configuration.')], ephemeral: true });
        }
    },
};
