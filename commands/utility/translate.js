const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { infoEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('translate')
        .setDescription('Traduire un texte (nécessite une clé API pour une traduction complète)')
        .addStringOption(option =>
            option.setName('texte')
                .setDescription('Le texte à traduire')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('langue')
                .setDescription('La langue cible (ex: en, fr, es, de, it, pt, ja, ko, zh)')
                .setRequired(true)),
    cooldown: 3,
    async execute(interaction, client) {
        const texte = interaction.options.getString('texte');
        const langue = interaction.options.getString('langue').toLowerCase();

        const langues = {
            'fr': 'Français', 'en': 'Anglais', 'es': 'Espagnol',
            'de': 'Allemand', 'it': 'Italien', 'pt': 'Portugais',
            'ja': 'Japonais', 'ko': 'Coréen', 'zh': 'Chinois',
            'ru': 'Russe', 'ar': 'Arabe', 'nl': 'Néerlandais',
        };

        const langName = langues[langue] || langue.toUpperCase();

        const embed = new EmbedBuilder()
            .setTitle('🌐 Traduction')
            .setDescription(`**Texte original :** ${texte}\n\n**Langue cible :** ${langName} (\`${langue}\`)`)
            .addFields(
                { name: '⚠️ Note', value: 'La traduction automatique complète nécessite une clé API externe (Google Translate, DeepL, etc.). Configurez votre clé API pour activer cette fonctionnalité.' }
            )
            .setColor('#FFA500')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
