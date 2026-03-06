const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('base64encode')
        .setDescription('Encoder un texte en Base64')
        .addStringOption(option =>
            option.setName('texte')
                .setDescription('Le texte à encoder')
                .setRequired(true)),
    cooldown: 3,
    async execute(interaction, client) {
        const texte = interaction.options.getString('texte');
        const encoded = Buffer.from(texte, 'utf-8').toString('base64');

        const embed = new EmbedBuilder()
            .setTitle('🔐 Encodage Base64')
            .addFields(
                { name: 'Texte original', value: `\`\`\`${texte}\`\`\`` },
                { name: 'Résultat encodé', value: `\`\`\`${encoded}\`\`\`` }
            )
            .setColor('#5865F2')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
