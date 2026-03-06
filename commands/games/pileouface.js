const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pileouface')
        .setDescription('Lancez une pièce - Pile ou Face !')
        .addStringOption(option =>
            option.setName('choix')
                .setDescription('Pariez sur pile ou face')
                .setRequired(true)
                .addChoices(
                    { name: '🪙 Pile', value: 'pile' },
                    { name: '👑 Face', value: 'face' }
                )),
    cooldown: 3,
    async execute(interaction, client) {
        const choix = interaction.options.getString('choix');
        const result = Math.random() < 0.5 ? 'pile' : 'face';
        const won = choix === result;
        const emojis = { pile: '🪙', face: '👑' };

        const embed = new EmbedBuilder()
            .setTitle('🪙 Pile ou Face')
            .setDescription(`La pièce tourne en l'air... 🌀\n\nElle tombe sur... **${emojis[result]} ${result.charAt(0).toUpperCase() + result.slice(1)}** !`)
            .addFields(
                { name: 'Votre pari', value: `${emojis[choix]} ${choix.charAt(0).toUpperCase() + choix.slice(1)}`, inline: true },
                { name: 'Résultat', value: `${emojis[result]} ${result.charAt(0).toUpperCase() + result.slice(1)}`, inline: true },
                { name: 'Issue', value: won ? '🎉 Vous avez gagné !' : '😢 Vous avez perdu !', inline: true }
            )
            .setColor(won ? '#00FF00' : '#FF0000')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
