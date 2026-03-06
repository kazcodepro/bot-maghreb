const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '⭐'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slots')
        .setDescription('Jouez à la machine à sous !'),
    cooldown: 3,
    async execute(interaction, client) {
        const results = [
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
        ];

        const allMatch = results[0] === results[1] && results[1] === results[2];
        const twoMatch = results[0] === results[1] || results[1] === results[2] || results[0] === results[2];

        let result, color;
        if (allMatch) {
            if (results[0] === '💎') {
                result = '💰 **JACKPOT !** Trois diamants ! Incroyable !';
            } else if (results[0] === '⭐') {
                result = '🌟 **SUPER GAIN !** Trois étoiles !';
            } else {
                result = '🎉 **GAGNÉ !** Trois symboles identiques !';
            }
            color = '#FFD700';
        } else if (twoMatch) {
            result = '😊 **Petit gain !** Deux symboles identiques !';
            color = '#00FF00';
        } else {
            result = '😢 **Perdu !** Aucun symbole identique.';
            color = '#FF0000';
        }

        const slotDisplay = `
╔═══════════╗
║ ${results[0]} ║ ${results[1]} ║ ${results[2]} ║
╚═══════════╝`;

        const embed = new EmbedBuilder()
            .setTitle('🎰 Machine à sous')
            .setDescription(`${slotDisplay}\n\n${result}`)
            .setColor(color)
            .setTimestamp()
            .setFooter({ text: `Joué par ${interaction.user.username}` });

        await interaction.reply({ embeds: [embed] });
    },
};
