const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-rename')
        .setDescription('Renommer le ticket actuel')
        .addStringOption(option =>
            option.setName('nom')
                .setDescription('Le nouveau nom du ticket')
                .setRequired(true)),
    cooldown: 3,
    async execute(interaction, client) {
        const ticket = db.getTicketByChannel(interaction.channel.id);

        if (!ticket) {
            return interaction.reply({ embeds: [errorEmbed('Cette commande doit être utilisée dans un ticket ouvert.')], ephemeral: true });
        }

        const name = interaction.options.getString('nom');

        try {
            await interaction.channel.setName(name);
            await interaction.reply({ embeds: [successEmbed(`Le ticket a été renommé en **${name}**.`)] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Impossible de renommer le ticket.')], ephemeral: true });
        }
    },
};
