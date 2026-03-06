const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-delete')
        .setDescription('Supprimer le ticket immédiatement')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 3,
    async execute(interaction, client) {
        const ticket = db.getTicketByChannel(interaction.channel.id);

        if (!ticket) {
            return interaction.reply({ embeds: [errorEmbed('Cette commande doit être utilisée dans un ticket.')], ephemeral: true });
        }

        try {
            db.updateTicket(interaction.channel.id, { status: 'closed' });
            await interaction.reply({ embeds: [successEmbed('Suppression du ticket en cours...')] });
            await interaction.channel.delete();
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Impossible de supprimer le ticket.')], ephemeral: true }).catch(() => {});
        }
    },
};
