const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('base64decode')
        .setDescription('Décoder un texte Base64')
        .addStringOption(option =>
            option.setName('texte')
                .setDescription('Le texte Base64 à décoder')
                .setRequired(true)),
    cooldown: 3,
    async execute(interaction, client) {
        const texte = interaction.options.getString('texte');

        try {
            const decoded = Buffer.from(texte, 'base64').toString('utf-8');

            const embed = new EmbedBuilder()
                .setTitle('🔓 Décodage Base64')
                .addFields(
                    { name: 'Texte encodé', value: `\`\`\`${texte}\`\`\`` },
                    { name: 'Résultat décodé', value: `\`\`\`${decoded}\`\`\`` }
                )
                .setColor('#5865F2')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Texte Base64 invalide.')], ephemeral: true });
        }
    },
};
