const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('editembed')
        .setDescription('Modifier un embed envoyé par le bot')
        .addStringOption(option =>
            option.setName('message_id')
                .setDescription('L\'ID du message à modifier')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('titre')
                .setDescription('Le nouveau titre')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('La nouvelle description')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('couleur')
                .setDescription('La nouvelle couleur en hexadécimal')
                .setRequired(false)),
    cooldown: 3,
    async execute(interaction, client) {
        const messageId = interaction.options.getString('message_id');
        const titre = interaction.options.getString('titre');
        const description = interaction.options.getString('description');
        const couleur = interaction.options.getString('couleur');

        try {
            const message = await interaction.channel.messages.fetch(messageId);

            if (message.author.id !== client.user.id) {
                return interaction.reply({ embeds: [errorEmbed('Je ne peux modifier que mes propres messages.')], ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle(titre)
                .setDescription(description)
                .setTimestamp();

            if (couleur) {
                const hexRegex = /^#?([0-9a-fA-F]{6})$/;
                const colorValue = couleur.startsWith('#') ? couleur : `#${couleur}`;
                if (!hexRegex.test(colorValue)) {
                    return interaction.reply({ embeds: [errorEmbed('Couleur hexadécimale invalide.')], ephemeral: true });
                }
                embed.setColor(colorValue);
            }

            await message.edit({ embeds: [embed] });
            await interaction.reply({ embeds: [successEmbed('L\'embed a été modifié avec succès.')], ephemeral: true });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Message introuvable. Vérifiez l\'ID.')], ephemeral: true });
        }
    },
};
