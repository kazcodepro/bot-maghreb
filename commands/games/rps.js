const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rps')
        .setDescription('Jouer à Pierre Papier Ciseaux contre le bot')
        .addStringOption(option =>
            option.setName('choix')
                .setDescription('Votre choix')
                .setRequired(true)
                .addChoices(
                    { name: '🪨 Pierre', value: 'pierre' },
                    { name: '📄 Papier', value: 'papier' },
                    { name: '✂️ Ciseaux', value: 'ciseaux' }
                )),
    cooldown: 3,
    async execute(interaction, client) {
        const choix = interaction.options.getString('choix');
        const choices = ['pierre', 'papier', 'ciseaux'];
        const emojis = { pierre: '🪨', papier: '📄', ciseaux: '✂️' };
        const botChoix = choices[Math.floor(Math.random() * 3)];

        let result;
        let color;
        if (choix === botChoix) {
            result = '🤝 Égalité !';
            color = '#FFA500';
        } else if (
            (choix === 'pierre' && botChoix === 'ciseaux') ||
            (choix === 'papier' && botChoix === 'pierre') ||
            (choix === 'ciseaux' && botChoix === 'papier')
        ) {
            result = '🎉 Vous avez gagné !';
            color = '#00FF00';
        } else {
            result = '😢 Vous avez perdu !';
            color = '#FF0000';
        }

        const embed = new EmbedBuilder()
            .setTitle('🎮 Pierre Papier Ciseaux')
            .setDescription(result)
            .addFields(
                { name: 'Votre choix', value: `${emojis[choix]} ${choix}`, inline: true },
                { name: 'Choix du bot', value: `${emojis[botChoix]} ${botChoix}`, inline: true }
            )
            .setColor(color)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
