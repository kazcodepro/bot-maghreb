const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const QUESTIONS = {
    culture: [
        { q: 'Qui a écrit "Les Misérables" ?', a: 'B', choices: ['Émile Zola', 'Victor Hugo', 'Gustave Flaubert', 'Alexandre Dumas'] },
        { q: 'Quelle est la langue officielle du Brésil ?', a: 'C', choices: ['Espagnol', 'Français', 'Portugais', 'Anglais'] },
        { q: 'Quel instrument a 88 touches ?', a: 'A', choices: ['Piano', 'Orgue', 'Accordéon', 'Synthétiseur'] },
        { q: 'De quel pays vient le sushi ?', a: 'B', choices: ['Chine', 'Japon', 'Corée', 'Thaïlande'] },
        { q: 'Qui a composé "La Flûte enchantée" ?', a: 'A', choices: ['Mozart', 'Beethoven', 'Bach', 'Vivaldi'] },
        { q: 'Quel est le film le plus rentable de tous les temps ?', a: 'D', choices: ['Titanic', 'Star Wars', 'Avengers: Endgame', 'Avatar'] },
        { q: 'Quelle danse est originaire d\'Argentine ?', a: 'C', choices: ['Salsa', 'Flamenco', 'Tango', 'Samba'] },
        { q: 'Qui a peint "La Nuit étoilée" ?', a: 'B', choices: ['Monet', 'Van Gogh', 'Picasso', 'Renoir'] },
        { q: 'Quel est le sport le plus pratiqué au monde ?', a: 'A', choices: ['Football', 'Cricket', 'Basketball', 'Tennis'] },
        { q: 'De quel pays vient la pizza ?', a: 'C', choices: ['France', 'Grèce', 'Italie', 'Espagne'] },
        { q: 'Qui a écrit "Le Petit Prince" ?', a: 'A', choices: ['Saint-Exupéry', 'Jules Verne', 'Albert Camus', 'Marcel Proust'] },
        { q: 'Quel pays a inventé le thé ?', a: 'B', choices: ['Japon', 'Chine', 'Inde', 'Angleterre'] },
        { q: 'Combien de cordes a un violon ?', a: 'D', choices: ['3', '5', '6', '4'] },
        { q: 'Quelle est la religion la plus pratiquée au monde ?', a: 'A', choices: ['Christianisme', 'Islam', 'Hindouisme', 'Bouddhisme'] },
        { q: 'Qui a réalisé "Inception" ?', a: 'C', choices: ['Spielberg', 'Tarantino', 'Nolan', 'Scorsese'] },
        { q: 'Quel jeu de société utilise un plateau de 64 cases ?', a: 'B', choices: ['Dames', 'Échecs', 'Go', 'Backgammon'] },
        { q: 'De quel pays viennent les pyramides de Gizeh ?', a: 'A', choices: ['Égypte', 'Mexique', 'Pérou', 'Irak'] },
        { q: 'Quelle est la capitale du Canada ?', a: 'D', choices: ['Toronto', 'Montréal', 'Vancouver', 'Ottawa'] },
        { q: 'Combien de joueurs dans une équipe de rugby ?', a: 'C', choices: ['11', '13', '15', '9'] },
        { q: 'Qui a inventé la théorie de la relativité ?', a: 'B', choices: ['Newton', 'Einstein', 'Hawking', 'Tesla'] },
    ],
    science: [
        { q: 'Quel gaz est le plus abondant dans l\'atmosphère ?', a: 'B', choices: ['Oxygène', 'Azote', 'CO2', 'Argon'] },
        { q: 'Combien de chromosomes a l\'être humain ?', a: 'C', choices: ['23', '44', '46', '48'] },
        { q: 'Quel est le symbole chimique du fer ?', a: 'A', choices: ['Fe', 'Fi', 'Fr', 'Ir'] },
        { q: 'Quelle planète est surnommée la planète rouge ?', a: 'D', choices: ['Jupiter', 'Vénus', 'Saturne', 'Mars'] },
        { q: 'Quel est le plus petit os du corps humain ?', a: 'A', choices: ['L\'étrier', 'Le marteau', 'L\'enclume', 'La phalange'] },
        { q: 'Combien de planètes dans le système solaire ?', a: 'B', choices: ['7', '8', '9', '10'] },
        { q: 'Quel est le métal le plus léger ?', a: 'C', choices: ['Aluminium', 'Magnésium', 'Lithium', 'Sodium'] },
        { q: 'Quelle est la formule du sel de table ?', a: 'A', choices: ['NaCl', 'KCl', 'NaOH', 'CaCl2'] },
        { q: 'Quel organe produit l\'insuline ?', a: 'B', choices: ['Foie', 'Pancréas', 'Reins', 'Rate'] },
        { q: 'Quelle est la vitesse du son dans l\'air ?', a: 'D', choices: ['100 m/s', '200 m/s', '500 m/s', '340 m/s'] },
        { q: 'Quel est le plus grand organe du corps humain ?', a: 'A', choices: ['La peau', 'Le foie', 'Les poumons', 'L\'intestin'] },
        { q: 'Combien de vertèbres a la colonne vertébrale ?', a: 'C', choices: ['26', '30', '33', '36'] },
        { q: 'Quel gaz les plantes absorbent-elles ?', a: 'B', choices: ['O2', 'CO2', 'N2', 'H2'] },
        { q: 'Quelle est la température d\'ébullition de l\'eau ?', a: 'A', choices: ['100°C', '90°C', '110°C', '120°C'] },
        { q: 'Quel scientifique a découvert la pénicilline ?', a: 'D', choices: ['Pasteur', 'Koch', 'Jenner', 'Fleming'] },
        { q: 'Combien de litres de sang dans le corps humain ?', a: 'B', choices: ['3', '5', '7', '10'] },
        { q: 'Quel est l\'élément le plus abondant dans l\'univers ?', a: 'A', choices: ['Hydrogène', 'Hélium', 'Oxygène', 'Carbone'] },
        { q: 'Quelle partie de l\'œil donne sa couleur ?', a: 'C', choices: ['La pupille', 'La cornée', 'L\'iris', 'La rétine'] },
        { q: 'Quel est le pH de l\'eau pure ?', a: 'B', choices: ['6', '7', '8', '5'] },
        { q: 'Quelle force nous maintient au sol ?', a: 'A', choices: ['Gravité', 'Magnétisme', 'Friction', 'Inertie'] },
    ],
    histoire: [
        { q: 'En quelle année a commencé la Première Guerre mondiale ?', a: 'B', choices: ['1912', '1914', '1916', '1918'] },
        { q: 'Qui était le premier président des États-Unis ?', a: 'A', choices: ['George Washington', 'Thomas Jefferson', 'Abraham Lincoln', 'John Adams'] },
        { q: 'Quelle civilisation a construit le Machu Picchu ?', a: 'C', choices: ['Aztèques', 'Mayas', 'Incas', 'Olmèques'] },
        { q: 'En quelle année est tombé le mur de Berlin ?', a: 'D', choices: ['1985', '1987', '1991', '1989'] },
        { q: 'Qui était Cléopâtre ?', a: 'B', choices: ['Reine de Grèce', 'Reine d\'Égypte', 'Reine de Rome', 'Reine de Perse'] },
        { q: 'La bataille de Waterloo a eu lieu en quelle année ?', a: 'A', choices: ['1815', '1812', '1820', '1805'] },
        { q: 'Qui a découvert l\'Amérique ?', a: 'C', choices: ['Vasco de Gama', 'Magellan', 'Christophe Colomb', 'Amerigo Vespucci'] },
        { q: 'Quel empire s\'est terminé en 1453 ?', a: 'B', choices: ['Romain', 'Byzantin', 'Ottoman', 'Perse'] },
        { q: 'Qui était le roi de France pendant la Révolution ?', a: 'D', choices: ['Louis XIV', 'Louis XV', 'Louis XVIII', 'Louis XVI'] },
        { q: 'En quelle année Napoléon est-il devenu empereur ?', a: 'A', choices: ['1804', '1800', '1810', '1799'] },
        { q: 'Quelle guerre a duré de 1337 à 1453 ?', a: 'C', choices: ['Guerre de Sept Ans', 'Croisades', 'Guerre de Cent Ans', 'Guerre de Trente Ans'] },
        { q: 'Qui a aboli l\'esclavage en France ?', a: 'B', choices: ['Napoléon', 'Victor Schœlcher', 'Robespierre', 'De Gaulle'] },
        { q: 'La Déclaration des droits de l\'homme date de quelle année ?', a: 'A', choices: ['1789', '1791', '1793', '1800'] },
        { q: 'Quel pays a lancé le premier satellite dans l\'espace ?', a: 'D', choices: ['États-Unis', 'France', 'Chine', 'URSS'] },
        { q: 'Qui a été le premier homme dans l\'espace ?', a: 'A', choices: ['Youri Gagarine', 'Neil Armstrong', 'Buzz Aldrin', 'John Glenn'] },
        { q: 'La Seconde Guerre mondiale s\'est terminée en quelle année ?', a: 'B', choices: ['1944', '1945', '1946', '1943'] },
        { q: 'Qui a fondé l\'Empire mongol ?', a: 'C', choices: ['Attila', 'Tamerlan', 'Gengis Khan', 'Kubilai Khan'] },
        { q: 'Quel pharaon possède le tombeau le plus célèbre ?', a: 'A', choices: ['Toutânkhamon', 'Ramsès II', 'Khéops', 'Néfertiti'] },
        { q: 'En quelle année la France a-t-elle été libérée ?', a: 'D', choices: ['1942', '1943', '1945', '1944'] },
        { q: 'Quelle est la plus ancienne civilisation connue ?', a: 'B', choices: ['Égyptienne', 'Sumérienne', 'Chinoise', 'Indienne'] },
    ],
    géographie: [
        { q: 'Quel est le plus long fleuve du monde ?', a: 'A', choices: ['Le Nil', 'L\'Amazone', 'Le Mississippi', 'Le Yangtsé'] },
        { q: 'Combien de pays en Afrique ?', a: 'C', choices: ['48', '52', '54', '56'] },
        { q: 'Quelle est la plus grande île du monde ?', a: 'B', choices: ['Madagascar', 'Groenland', 'Bornéo', 'Nouvelle-Guinée'] },
        { q: 'Dans quel océan se trouve Madagascar ?', a: 'D', choices: ['Pacifique', 'Atlantique', 'Arctique', 'Indien'] },
        { q: 'Quelle est la capitale de l\'Australie ?', a: 'C', choices: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'] },
        { q: 'Quel est le plus petit continent ?', a: 'A', choices: ['Océanie', 'Europe', 'Antarctique', 'Amérique du Sud'] },
        { q: 'Quel pays a le plus d\'habitants ?', a: 'B', choices: ['Inde', 'Chine', 'États-Unis', 'Indonésie'] },
        { q: 'Quel désert est le plus grand du monde ?', a: 'D', choices: ['Gobi', 'Kalahari', 'Atacama', 'Sahara'] },
        { q: 'Quelle mer borde le sud de la France ?', a: 'A', choices: ['Méditerranée', 'Adriatique', 'Baltique', 'Noire'] },
        { q: 'Quel est le point le plus haut d\'Afrique ?', a: 'C', choices: ['Mont Kenya', 'Atlas', 'Kilimandjaro', 'Drakensberg'] },
        { q: 'Combien d\'États aux États-Unis ?', a: 'B', choices: ['48', '50', '52', '54'] },
        { q: 'Quelle est la capitale du Japon ?', a: 'A', choices: ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama'] },
        { q: 'Quel fleuve traverse Paris ?', a: 'D', choices: ['La Loire', 'Le Rhône', 'La Garonne', 'La Seine'] },
        { q: 'Quel pays est surnommé le pays du soleil levant ?', a: 'C', choices: ['Chine', 'Corée', 'Japon', 'Vietnam'] },
        { q: 'Quelle est la monnaie de l\'Angleterre ?', a: 'B', choices: ['Euro', 'Livre sterling', 'Dollar', 'Franc'] },
        { q: 'Quel est le plus grand pays d\'Amérique du Sud ?', a: 'A', choices: ['Brésil', 'Argentine', 'Colombie', 'Pérou'] },
        { q: 'Quelle chaîne de montagnes sépare la France de l\'Espagne ?', a: 'D', choices: ['Alpes', 'Jura', 'Vosges', 'Pyrénées'] },
        { q: 'Combien de régions en France métropolitaine ?', a: 'C', choices: ['11', '12', '13', '14'] },
        { q: 'Quelle est la capitale de la Turquie ?', a: 'B', choices: ['Istanbul', 'Ankara', 'Izmir', 'Antalya'] },
        { q: 'Quel océan est le plus profond ?', a: 'A', choices: ['Pacifique', 'Atlantique', 'Indien', 'Arctique'] },
    ]
};

const LABELS = ['A', 'B', 'C', 'D'];
const CATEGORY_EMOJIS = { culture: '🎭', science: '🔬', histoire: '📜', géographie: '🌍' };

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quiz')
        .setDescription('Quiz avec différentes catégories')
        .addStringOption(option =>
            option.setName('catégorie')
                .setDescription('Choisissez une catégorie')
                .addChoices(
                    { name: '🎭 Culture', value: 'culture' },
                    { name: '🔬 Science', value: 'science' },
                    { name: '📜 Histoire', value: 'histoire' },
                    { name: '🌍 Géographie', value: 'géographie' }
                )),
    cooldown: 5,
    async execute(interaction, client) {
        const categories = Object.keys(QUESTIONS);
        const category = interaction.options.getString('catégorie') || categories[Math.floor(Math.random() * categories.length)];
        const pool = QUESTIONS[category];
        const question = pool[Math.floor(Math.random() * pool.length)];

        const embed = new EmbedBuilder()
            .setTitle(`${CATEGORY_EMOJIS[category]} Quiz - ${category.charAt(0).toUpperCase() + category.slice(1)}`)
            .setDescription(`**${question.q}**`)
            .addFields(
                question.choices.map((c, i) => ({ name: LABELS[i], value: c, inline: true }))
            )
            .setColor('#5865F2')
            .setFooter({ text: 'Vous avez 15 secondes pour répondre !' });

        const row = new ActionRowBuilder().addComponents(
            LABELS.map(l => new ButtonBuilder().setCustomId(`quiz_${l}`).setLabel(l).setStyle(ButtonStyle.Primary))
        );

        const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });
        const collector = msg.createMessageComponentCollector({ time: 15_000 });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) return i.reply({ content: 'Ce n\'est pas votre quiz !', ephemeral: true });
            collector.stop('answered');

            const chosen = i.customId.split('_')[1];
            const correct = chosen === question.a;
            const correctIdx = LABELS.indexOf(question.a);

            const resultRow = new ActionRowBuilder().addComponents(
                LABELS.map(l =>
                    new ButtonBuilder()
                        .setCustomId(`quiz_${l}`)
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
                        new ButtonBuilder().setCustomId(`quiz_${l}`).setLabel(l)
                            .setStyle(l === question.a ? ButtonStyle.Success : ButtonStyle.Secondary).setDisabled(true)
                    )
                );
                embed.setColor('#FF0000')
                    .setDescription(`**${question.q}**\n\n⏰ Temps écoulé ! La bonne réponse était **${question.a}. ${question.choices[correctIdx]}**`);
                msg.edit({ embeds: [embed], components: [timeoutRow] }).catch(() => {});
            }
        });
    },
};
