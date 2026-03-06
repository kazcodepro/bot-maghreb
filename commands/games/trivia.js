const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const QUESTIONS = [
    { q: 'Quelle est la capitale de la France ?', a: 'A', choices: ['Paris', 'Lyon', 'Marseille', 'Toulouse'] },
    { q: 'Combien de continents y a-t-il ?', a: 'B', choices: ['5', '7', '6', '8'] },
    { q: 'Quel est le plus grand océan du monde ?', a: 'C', choices: ['Atlantique', 'Indien', 'Pacifique', 'Arctique'] },
    { q: 'En quelle année l\'homme a-t-il marché sur la Lune ?', a: 'B', choices: ['1965', '1969', '1972', '1959'] },
    { q: 'Quel est l\'élément chimique symbolisé par O ?', a: 'A', choices: ['Oxygène', 'Or', 'Osmium', 'Oganesson'] },
    { q: 'Combien de joueurs composent une équipe de football ?', a: 'C', choices: ['9', '10', '11', '12'] },
    { q: 'Quel est le plus long fleuve de France ?', a: 'A', choices: ['La Loire', 'La Seine', 'Le Rhône', 'La Garonne'] },
    { q: 'Qui a peint la Joconde ?', a: 'B', choices: ['Michel-Ange', 'Léonard de Vinci', 'Raphaël', 'Botticelli'] },
    { q: 'Quelle est la planète la plus proche du Soleil ?', a: 'A', choices: ['Mercure', 'Vénus', 'Mars', 'Terre'] },
    { q: 'Combien de dents a un adulte ?', a: 'D', choices: ['28', '30', '34', '32'] },
    { q: 'Quel animal est le plus rapide du monde ?', a: 'B', choices: ['Lion', 'Guépard', 'Faucon', 'Lièvre'] },
    { q: 'Quelle est la monnaie du Japon ?', a: 'C', choices: ['Won', 'Yuan', 'Yen', 'Ringgit'] },
    { q: 'En quelle année a eu lieu la Révolution française ?', a: 'A', choices: ['1789', '1799', '1776', '1804'] },
    { q: 'Quel est le symbole chimique de l\'eau ?', a: 'B', choices: ['HO', 'H2O', 'O2H', 'OH2'] },
    { q: 'Combien de côtés a un hexagone ?', a: 'C', choices: ['5', '7', '6', '8'] },
    { q: 'Quel pays a la plus grande superficie ?', a: 'A', choices: ['Russie', 'Canada', 'Chine', 'États-Unis'] },
    { q: 'Quelle est la vitesse de la lumière ?', a: 'D', choices: ['100 000 km/s', '200 000 km/s', '250 000 km/s', '300 000 km/s'] },
    { q: 'Quel est le plus haut sommet du monde ?', a: 'A', choices: ['Everest', 'K2', 'Kangchenjunga', 'Mont Blanc'] },
    { q: 'Combien d\'os a le corps humain adulte ?', a: 'B', choices: ['195', '206', '212', '186'] },
    { q: 'Quel est le plus petit pays du monde ?', a: 'C', choices: ['Monaco', 'Nauru', 'Vatican', 'Saint-Marin'] },
    { q: 'Quelle est la langue la plus parlée au monde ?', a: 'B', choices: ['Anglais', 'Mandarin', 'Espagnol', 'Hindi'] },
    { q: 'De quoi est composé le soleil principalement ?', a: 'A', choices: ['Hydrogène', 'Hélium', 'Carbone', 'Oxygène'] },
];

const LABELS = ['A', 'B', 'C', 'D'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trivia')
        .setDescription('Répondez à une question de culture générale'),
    cooldown: 5,
    async execute(interaction, client) {
        const question = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];

        const embed = new EmbedBuilder()
            .setTitle('🧠 Trivia')
            .setDescription(`**${question.q}**`)
            .addFields(
                question.choices.map((c, i) => ({ name: `${LABELS[i]}`, value: c, inline: true }))
            )
            .setColor('#5865F2')
            .setFooter({ text: 'Vous avez 15 secondes pour répondre !' });

        const row = new ActionRowBuilder().addComponents(
            LABELS.map((l, i) =>
                new ButtonBuilder()
                    .setCustomId(`trivia_${l}`)
                    .setLabel(l)
                    .setStyle(ButtonStyle.Primary)
            )
        );

        const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

        const collector = msg.createMessageComponentCollector({ time: 15_000 });
        const answered = new Set();

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({ content: 'Ce n\'est pas votre question !', ephemeral: true });
            }
            if (answered.has(i.user.id)) return i.reply({ content: 'Vous avez déjà répondu !', ephemeral: true });
            answered.add(i.user.id);
            collector.stop('answered');

            const chosen = i.customId.split('_')[1];
            const correct = chosen === question.a;
            const correctIdx = LABELS.indexOf(question.a);

            const resultRow = new ActionRowBuilder().addComponents(
                LABELS.map((l, idx) =>
                    new ButtonBuilder()
                        .setCustomId(`trivia_${l}`)
                        .setLabel(l)
                        .setStyle(l === question.a ? ButtonStyle.Success : (l === chosen && !correct) ? ButtonStyle.Danger : ButtonStyle.Secondary)
                        .setDisabled(true)
                )
            );

            embed.setColor(correct ? '#00FF00' : '#FF0000')
                .setDescription(`**${question.q}**\n\n${correct ? '✅ Bonne réponse !' : `❌ Mauvaise réponse ! La bonne réponse était **${question.a}. ${question.choices[correctIdx]}**`}`);

            await i.update({ embeds: [embed], components: [resultRow] });
        });

        collector.on('end', (_, reason) => {
            if (reason === 'time') {
                const correctIdx = LABELS.indexOf(question.a);
                const timeoutRow = new ActionRowBuilder().addComponents(
                    LABELS.map(l =>
                        new ButtonBuilder()
                            .setCustomId(`trivia_${l}`)
                            .setLabel(l)
                            .setStyle(l === question.a ? ButtonStyle.Success : ButtonStyle.Secondary)
                            .setDisabled(true)
                    )
                );
                embed.setColor('#FF0000')
                    .setDescription(`**${question.q}**\n\n⏰ Temps écoulé ! La bonne réponse était **${question.a}. ${question.choices[correctIdx]}**`);
                msg.edit({ embeds: [embed], components: [timeoutRow] }).catch(() => {});
            }
        });
    },
};
