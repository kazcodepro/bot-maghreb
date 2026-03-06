const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-add')
        .setDescription('Ajouter un utilisateur au ticket actuel')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à ajouter')
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
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true
            });

            await interaction.reply({ embeds: [successEmbed(`${user} a été ajouté au ticket.`)] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Impossible d\'ajouter cet utilisateur au ticket.')], ephemeral: true });
        }
    },
};
