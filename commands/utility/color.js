const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { errorEmbed, randomInt } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('color')
        .setDescription('Afficher les informations d\'une couleur ou en générer une aléatoire')
        .addStringOption(option =>
            option.setName('hex')
                .setDescription('Le code hexadécimal (ex: #ff5733)')
                .setRequired(false)),
    cooldown: 3,
    async execute(interaction, client) {
        let hex = interaction.options.getString('hex');

        if (!hex) {
            const r = randomInt(0, 255);
            const g = randomInt(0, 255);
            const b = randomInt(0, 255);
            hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        }

        hex = hex.startsWith('#') ? hex : `#${hex}`;
        const hexRegex = /^#([0-9a-fA-F]{6})$/;

        if (!hexRegex.test(hex)) {
            return interaction.reply({ embeds: [errorEmbed('Code hexadécimal invalide. Exemple: `#ff5733`')], ephemeral: true });
        }

        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        const embed = new EmbedBuilder()
            .setTitle(`🎨 Couleur ${hex.toUpperCase()}`)
            .setColor(hex)
            .addFields(
                { name: 'HEX', value: `\`${hex.toUpperCase()}\``, inline: true },
                { name: 'RGB', value: `\`rgb(${r}, ${g}, ${b})\``, inline: true },
                { name: 'Décimal', value: `\`${parseInt(hex.slice(1), 16)}\``, inline: true }
            )
            .setThumbnail(`https://singlecolorimage.com/get/${hex.slice(1)}/100x100`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
