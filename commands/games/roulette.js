const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const RED_NUMBERS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
const BLACK_NUMBERS = [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roulette')
        .setDescription('Jouez à la roulette - Pariez sur une couleur')
        .addStringOption(option =>
            option.setName('couleur')
                .setDescription('Choisissez votre couleur')
                .setRequired(true)
                .addChoices(
                    { name: '🔴 Rouge', value: 'rouge' },
                    { name: '⚫ Noir', value: 'noir' },
                    { name: '🟢 Vert', value: 'vert' }
                )),
    cooldown: 3,
    async execute(interaction, client) {
        const choix = interaction.options.getString('couleur');
        const number = Math.floor(Math.random() * 37);

        let resultColor;
        if (number === 0) resultColor = 'vert';
        else if (RED_NUMBERS.includes(number)) resultColor = 'rouge';
        else resultColor = 'noir';

        const colorEmojis = { rouge: '🔴', noir: '⚫', vert: '🟢' };
        const won = choix === resultColor;

        let multiplier = '';
        if (won) {
            multiplier = choix === 'vert' ? '(x35)' : '(x2)';
        }

        const embed = new EmbedBuilder()
            .setTitle('🎡 Roulette')
            .setDescription(`La bille tourne... et s'arrête sur le **${number}** ${colorEmojis[resultColor]} **${resultColor}** !`)
            .addFields(
                { name: 'Votre pari', value: `${colorEmojis[choix]} ${choix}`, inline: true },
                { name: 'Résultat', value: `${colorEmojis[resultColor]} ${resultColor} (${number})`, inline: true },
                { name: 'Issue', value: won ? `🎉 Gagné ! ${multiplier}` : '😢 Perdu !', inline: true }
            )
            .setColor(won ? '#00FF00' : '#FF0000')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
