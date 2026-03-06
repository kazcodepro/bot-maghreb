const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('edit')
        .setDescription('Modifier un message envoyé par le bot')
        .addStringOption(option =>
            option.setName('message_id')
                .setDescription('L\'ID du message à modifier')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('contenu')
                .setDescription('Le nouveau contenu du message')
                .setRequired(true)),
    cooldown: 3,
    async execute(interaction, client) {
        const messageId = interaction.options.getString('message_id');
        const contenu = interaction.options.getString('contenu');

        try {
            const message = await interaction.channel.messages.fetch(messageId);

            if (message.author.id !== client.user.id) {
                return interaction.reply({ embeds: [errorEmbed('Je ne peux modifier que mes propres messages.')], ephemeral: true });
            }

            await message.edit({ content: contenu });
            await interaction.reply({ embeds: [successEmbed('Le message a été modifié avec succès.')], ephemeral: true });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Message introuvable. Vérifiez l\'ID.')], ephemeral: true });
        }
    },
};
