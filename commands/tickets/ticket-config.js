const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-config')
        .setDescription('Voir la configuration actuelle du système de tickets')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 3,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        try {
            const settings = db.getGuildSettings(interaction.guild.id);

            const category = settings.ticket_category
                ? interaction.guild.channels.cache.get(settings.ticket_category)?.name || 'Introuvable'
                : 'Non configuré';

            const logChannel = settings.ticket_log_channel
                ? `<#${settings.ticket_log_channel}>`
                : 'Non configuré';

            const supportRole = settings.ticket_support_role
                ? `<@&${settings.ticket_support_role}>`
                : 'Non configuré';

            const embed = new EmbedBuilder()
                .setColor(config.colors.primary)
                .setTitle(`${config.emojis.ticket} Configuration des Tickets`)
                .addFields(
                    { name: '📁 Catégorie', value: category, inline: true },
                    { name: '📝 Salon de logs', value: logChannel, inline: true },
                    { name: '🛡️ Rôle support', value: supportRole, inline: true }
                )
                .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue.')], ephemeral: true });
        }
    },
};
