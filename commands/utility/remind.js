const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed, parseDuration, formatDuration } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remind')
        .setDescription('Définir un rappel')
        .addStringOption(option =>
            option.setName('durée')
                .setDescription('Dans combien de temps (ex: 5m, 1h, 2h30m)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Le message du rappel')
                .setRequired(true)),
    cooldown: 3,
    async execute(interaction, client) {
        const duréeStr = interaction.options.getString('durée');
        const message = interaction.options.getString('message');
        const ms = parseDuration(duréeStr);

        if (!ms || ms <= 0) {
            return interaction.reply({ embeds: [errorEmbed('Durée invalide. Utilisez un format comme `5m`, `1h`, `30s`.')], ephemeral: true });
        }

        if (ms > 30 * 24 * 60 * 60 * 1000) {
            return interaction.reply({ embeds: [errorEmbed('La durée maximale est de 30 jours.')], ephemeral: true });
        }

        const expireAt = Date.now() + ms;

        try {
            db.addReminder(interaction.user.id, interaction.channel.id, interaction.guild.id, message, expireAt);
        } catch (err) {
            return interaction.reply({ embeds: [errorEmbed('Une erreur est survenue lors de l\'enregistrement du rappel.')], ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle('⏰ Rappel défini')
            .setDescription(`Je te rappellerai dans **${formatDuration(ms)}**.\n\n**Message:** ${message}`)
            .setColor('#5865F2')
            .setFooter({ text: `Expire le` })
            .setTimestamp(new Date(expireAt));

        await interaction.reply({ embeds: [embed] });
    },
};
