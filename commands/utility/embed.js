const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Créer un embed personnalisé')
        .addStringOption(option =>
            option.setName('titre')
                .setDescription('Le titre de l\'embed')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('La description de l\'embed')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('couleur')
                .setDescription('La couleur en hexadécimal (ex: #ff0000)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('footer')
                .setDescription('Le texte du footer')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('image')
                .setDescription('L\'URL de l\'image')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('thumbnail')
                .setDescription('L\'URL du thumbnail')
                .setRequired(false)),
    cooldown: 3,
    async execute(interaction, client) {
        const titre = interaction.options.getString('titre');
        const description = interaction.options.getString('description');
        const couleur = interaction.options.getString('couleur') || '#5865F2';
        const footer = interaction.options.getString('footer');
        const image = interaction.options.getString('image');
        const thumbnail = interaction.options.getString('thumbnail');

        const hexRegex = /^#?([0-9a-fA-F]{6})$/;
        const colorValue = couleur.startsWith('#') ? couleur : `#${couleur}`;
        if (!hexRegex.test(colorValue)) {
            return interaction.reply({ embeds: [errorEmbed('Couleur hexadécimale invalide. Exemple: `#ff0000`')], ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle(titre)
            .setDescription(description)
            .setColor(colorValue);

        if (footer) embed.setFooter({ text: footer });
        if (image) embed.setImage(image);
        if (thumbnail) embed.setThumbnail(thumbnail);
        embed.setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
