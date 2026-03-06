const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed, parseDuration, formatDuration } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timer')
        .setDescription('Définir un minuteur')
        .addStringOption(option =>
            option.setName('durée')
                .setDescription('La durée du minuteur (ex: 5m, 1h, 30s)')
                .setRequired(true)),
    cooldown: 3,
    async execute(interaction, client) {
        const duréeStr = interaction.options.getString('durée');
        const ms = parseDuration(duréeStr);

        if (!ms || ms <= 0) {
            return interaction.reply({ embeds: [errorEmbed('Durée invalide. Utilisez un format comme `5m`, `1h`, `30s`.')], ephemeral: true });
        }

        if (ms > 24 * 60 * 60 * 1000) {
            return interaction.reply({ embeds: [errorEmbed('La durée maximale est de 24 heures.')], ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle('⏱️ Minuteur démarré')
            .setDescription(`Le minuteur de **${formatDuration(ms)}** a été lancé.`)
            .setColor('#5865F2')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        setTimeout(async () => {
            const doneEmbed = new EmbedBuilder()
                .setTitle('⏱️ Temps écoulé !')
                .setDescription(`${interaction.user}, ton minuteur de **${formatDuration(ms)}** est terminé !`)
                .setColor('#00ff00')
                .setTimestamp();

            await interaction.channel.send({ content: `${interaction.user}`, embeds: [doneEmbed] });
        }, ms);
    },
};
