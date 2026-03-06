const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setwelcome')
        .setDescription('Configurer le système de bienvenue')
        .addChannelOption(option =>
            option.setName('salon')
                .setDescription('Le salon de bienvenue')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Le message de bienvenue ({user}, {server}, {membercount})')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 5,
    async execute(interaction, client) {
        const channel = interaction.options.getChannel('salon');
        const message = interaction.options.getString('message') || 'Bienvenue {user} sur **{server}** ! Tu es le {membercount}ème membre !';

        try {
            await db.updateGuildSetting(interaction.guild.id, 'welcome_channel', channel.id);
            await db.updateGuildSetting(interaction.guild.id, 'welcome_message', message);
            await db.updateGuildSetting(interaction.guild.id, 'welcome_enabled', 'true');

            const preview = message
                .replace('{user}', interaction.user)
                .replace('{server}', interaction.guild.name)
                .replace('{membercount}', interaction.guild.memberCount);

            const embed = new EmbedBuilder()
                .setTitle('👋 Système de bienvenue configuré')
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
