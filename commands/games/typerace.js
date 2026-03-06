const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const SENTENCES = [
    'Le chat dort sur le canapé bleu.',
    'Il fait beau aujourd\'hui dans le jardin.',
    'La voiture rouge roule sur la route.',
    'Les enfants jouent dans le parc avec joie.',
    'Le soleil brille dans le ciel bleu.',
    'Ma sœur prépare un gâteau au chocolat.',
    'Le train arrive à la gare à midi.',
    'Les oiseaux chantent dans les arbres verts.',
    'Pierre lit un livre dans sa chambre.',
    'La pluie tombe doucement sur les toits.',
    'Les fleurs poussent dans le jardin coloré.',
    'Le chien court après le ballon rouge.',
    'Marie danse sous la pluie avec grâce.',
    'Le vent souffle fort sur la montagne.',
    'Les étoiles brillent dans la nuit noire.',
    'Mon frère joue de la guitare ce soir.',
    'La lune éclaire le chemin dans la forêt.',
    'Le boulanger prépare du pain chaque matin.',
    'Les poissons nagent dans la rivière claire.',
    'Le professeur explique la leçon aux élèves.',
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('typerace')
        .setDescription('Course de frappe - Tapez une phrase le plus vite possible !'),
    cooldown: 10,
    async execute(interaction, client) {
        const sentence = SENTENCES[Math.floor(Math.random() * SENTENCES.length)];

        const embed = new EmbedBuilder()
            .setTitle('⌨️ Course de Frappe')
            .setDescription(`Tapez la phrase suivante le plus vite possible !\n\n\`\`\`${sentence}\`\`\``)
            .setColor('#5865F2')
            .setFooter({ text: 'Vous avez 30 secondes !' });

        const startTime = Date.now();
        await interaction.reply({ embeds: [embed] });

        const collector = interaction.channel.createMessageCollector({
            filter: m => m.author.id === interaction.user.id,
            time: 30_000,
            max: 5
        });

        collector.on('collect', async m => {
            const input = m.content.trim();
            m.delete().catch(() => {});

            if (input === sentence) {
                collector.stop('won');
                const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
                const wpm = Math.round((sentence.split(' ').length / elapsed) * 60);

                const resultEmbed = new EmbedBuilder()
                    .setTitle('⌨️ Course de Frappe - Terminé !')
                    .setDescription(`✅ **Parfait !** Vous avez tapé la phrase correctement !`)
                    .addFields(
                        { name: '⏱️ Temps', value: `${elapsed} secondes`, inline: true },
                        { name: '📊 Vitesse', value: `~${wpm} mots/min`, inline: true },
                        { name: '📝 Phrase', value: `\`\`\`${sentence}\`\`\``, inline: false }
                    )
                    .setColor('#00FF00')
                    .setTimestamp();

                await interaction.editReply({ embeds: [resultEmbed] });
            } else {
                let correctChars = 0;
                for (let i = 0; i < Math.min(input.length, sentence.length); i++) {
                    if (input[i] === sentence[i]) correctChars++;
                }
                const accuracy = Math.round((correctChars / sentence.length) * 100);

                const retryEmbed = new EmbedBuilder()
                    .setTitle('⌨️ Course de Frappe')
                    .setDescription(`❌ Ce n'est pas tout à fait ça ! (**${accuracy}%** de précision)\nRéessayez !\n\n\`\`\`${sentence}\`\`\``)
                    .setColor('#FFA500')
                    .setFooter({ text: 'Tapez la phrase exactement comme affichée !' });

                await interaction.editReply({ embeds: [retryEmbed] });
            }
        });

        collector.on('end', (_, reason) => {
            if (reason === 'time') {
                const timeEmbed = new EmbedBuilder()
                    .setTitle('⌨️ Course de Frappe')
                    .setDescription('⏰ Temps écoulé ! Réessayez avec `+typerace` !')
                    .setColor('#FF0000');
                interaction.editReply({ embeds: [timeEmbed] }).catch(() => {});
            }
        });
    },
};
