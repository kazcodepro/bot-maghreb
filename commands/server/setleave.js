const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setleave')
        .setDescription('Configurer le système de départ')
        .addChannelOption(option =>
            option.setName('salon')
                .setDescription('Le salon de départ')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Le message de départ ({user}, {server}, {membercount})')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 5,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const channel = interaction.options.getChannel('salon');
        const message = interaction.options.getString('message') || '{user} a quitté **{server}**. Nous sommes maintenant {membercount} membres.';

        try {
            await db.updateGuildSetting(interaction.guild.id, 'leave_channel', channel.id);
            await db.updateGuildSetting(interaction.guild.id, 'leave_message', message);
            await db.updateGuildSetting(interaction.guild.id, 'leave_enabled', 'true');

            const preview = message
                .replace('{user}', interaction.user)
                .replace('{server}', interaction.guild.name)
                .replace('{membercount}', interaction.guild.memberCount);

            const embed = new EmbedBuilder()
                .setTitle('👋 Système de départ configuré')
                .setDescription(`**Salon :** ${channel}\n**Message :** ${message}`)
                .addFields({ name: 'Aperçu', value: preview })
                .setColor('#00ff00')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue lors de la configuration.')], ephemeral: true });
        }
    },
};
