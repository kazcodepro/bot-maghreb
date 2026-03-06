const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed, warningEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-claim')
        .setDescription('Prendre en charge le ticket actuel'),
    cooldown: 3,
    async execute(interaction, client) {
        const ticket = db.getTicketByChannel(interaction.channel.id);

        if (!ticket) {
            return interaction.reply({ embeds: [errorEmbed('Cette commande doit être utilisée dans un ticket ouvert.')], ephemeral: true });
        }

        if (ticket.claimed_by) {
            return interaction.reply({ embeds: [warningEmbed(`Ce ticket est déjà pris en charge par <@${ticket.claimed_by}>.`)], ephemeral: true });
        }

        const settings = db.getGuildSettings(interaction.guild.id);
        const member = await interaction.guild.members.fetch(interaction.user.id);
        const isSupport = settings.ticket_support_role && member.roles.cache.has(settings.ticket_support_role);
        const isAdmin = member.permissions.has(PermissionFlagsBits.Administrator);

        if (!isSupport && !isAdmin) {
            return interaction.reply({ embeds: [errorEmbed('Vous n\'avez pas la permission de prendre en charge ce ticket.')], ephemeral: true });
        }

        try {
            db.updateTicket(interaction.channel.id, { claimed_by: interaction.user.id });
            await interaction.reply({ embeds: [successEmbed(`Ce ticket est maintenant pris en charge par ${interaction.user}.`)] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue.')], ephemeral: true });
        }
    },
};
