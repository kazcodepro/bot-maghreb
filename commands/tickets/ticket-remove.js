const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-remove')
        .setDescription('Retirer un utilisateur du ticket actuel')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à retirer')
                .setRequired(true)),
    cooldown: 3,
    async execute(interaction, client) {
        const ticket = db.getTicketByChannel(interaction.channel.id);

        if (!ticket) {
            return interaction.reply({ embeds: [errorEmbed('Cette commande doit être utilisée dans un ticket ouvert.')], ephemeral: true });
        }

        const user = interaction.options.getUser('utilisateur');

        try {
            await interaction.channel.permissionOverwrites.edit(user.id, {
                ViewChannel: false,
                SendMessages: false
            });

            await interaction.reply({ embeds: [successEmbed(`${user} a été retiré du ticket.`)] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Impossible de retirer cet utilisateur du ticket.')], ephemeral: true });
        }
    },
};
