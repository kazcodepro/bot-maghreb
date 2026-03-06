const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-close')
        .setDescription('Fermer le ticket actuel'),
    cooldown: 3,
    async execute(interaction, client) {
        const ticket = db.getTicketByChannel(interaction.channel.id);

        if (!ticket) {
            return interaction.reply({ embeds: [errorEmbed('Cette commande doit être utilisée dans un ticket ouvert.')], ephemeral: true });
        }

        try {
            db.updateTicket(interaction.channel.id, { status: 'closed' });

            await interaction.reply({ embeds: [successEmbed('Ce ticket sera fermé dans **5 secondes**...')] });

            setTimeout(async () => {
                try {
                    await interaction.channel.delete();
                } catch {}
            }, 5000);
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue lors de la fermeture du ticket.')], ephemeral: true });
        }
    },
};
