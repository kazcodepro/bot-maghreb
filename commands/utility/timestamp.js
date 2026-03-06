const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timestamp')
        .setDescription('Convertir une date en timestamps Discord')
        .addStringOption(option =>
            option.setName('date')
                .setDescription('La date à convertir (ex: 2025-12-25, 2025-12-25 18:00)')
                .setRequired(true)),
    cooldown: 3,
    async execute(interaction, client) {
        const dateStr = interaction.options.getString('date');
        const date = new Date(dateStr);

        if (isNaN(date.getTime())) {
            return interaction.reply({ embeds: [errorEmbed('Date invalide. Utilisez un format comme `2025-12-25` ou `2025-12-25 18:00`.')], ephemeral: true });
        }

        const unix = Math.floor(date.getTime() / 1000);

        const formats = [
            { name: 'Date courte', format: 'd', example: `<t:${unix}:d>` },
            { name: 'Date longue', format: 'D', example: `<t:${unix}:D>` },
            { name: 'Heure courte', format: 't', example: `<t:${unix}:t>` },
            { name: 'Heure longue', format: 'T', example: `<t:${unix}:T>` },
            { name: 'Date et heure courte', format: 'f', example: `<t:${unix}:f>` },
            { name: 'Date et heure longue', format: 'F', example: `<t:${unix}:F>` },
            { name: 'Relatif', format: 'R', example: `<t:${unix}:R>` },
        ];

        const description = formats.map(f =>
            `**${f.name}** (\`${f.format}\`)\n${f.example} — \`<t:${unix}:${f.format}>\``
        ).join('\n\n');

        const embed = new EmbedBuilder()
            .setTitle('🕐 Timestamps Discord')
            .setDescription(description)
            .addFields({ name: 'Unix Timestamp', value: `\`${unix}\`` })
            .setColor('#5865F2')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
