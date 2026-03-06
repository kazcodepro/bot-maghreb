const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { errorEmbed } = require('../../utils/functions');

const WORDS = [
    'animal', 'maison', 'voiture', 'ordinateur', 'chocolat', 'musique', 'jardin',
    'cuisine', 'fenetre', 'montagne', 'riviere', 'chateau', 'poisson', 'cheval',
    'papillon', 'etoile', 'soleil', 'nuage', 'fleur', 'arbre', 'bateau',
    'avion', 'plage', 'foret', 'village', 'bougie', 'dragon', 'pirate',
    'fantome', 'guitare', 'pomme', 'cerise', 'requin', 'tigre', 'sirene'
];

const HANGMAN_STAGES = [
    '```\n  +---+\n      |\n      |\n      |\n      |\n=========```',
    '```\n  +---+\n  O   |\n      |\n      |\n      |\n=========```',
    '```\n  +---+\n  O   |\n  |   |\n      |\n      |\n=========```',
    '```\n  +---+\n  O   |\n /|   |\n      |\n      |\n=========```',
    '```\n  +---+\n  O   |\n /|\\  |\n      |\n      |\n=========```',
    '```\n  +---+\n  O   |\n /|\\  |\n /    |\n      |\n=========```',
    '```\n  +---+\n  O   |\n /|\\  |\n / \\  |\n      |\n=========```'
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hangman')
        .setDescription('Jouer au Pendu - Devinez le mot lettre par lettre'),
    cooldown: 5,
    async execute(interaction, client) {
        const word = WORDS[Math.floor(Math.random() * WORDS.length)].toUpperCase();
        const guessed = new Set();
        let lives = 6;

        function getDisplay() {
            return word.split('').map(l => guessed.has(l) ? l : '\_').join(' ');
        }

        function buildEmbed() {
            const display = getDisplay();
            return new EmbedBuilder()
                .setTitle('🎮 Pendu')
                .setDescription(HANGMAN_STAGES[6 - lives])
                .addFields(
                    { name: 'Mot', value: `\`${display}\``, inline: false },
                    { name: '❤️ Vies restantes', value: `${'❤️'.repeat(lives)}${'🖤'.repeat(6 - lives)}`, inline: true },
                    { name: '📝 Lettres essayées', value: guessed.size > 0 ? [...guessed].join(', ') : 'Aucune', inline: true }
                )
                .setColor(lives > 3 ? '#00FF00' : lives > 1 ? '#FFA500' : '#FF0000')
                .setFooter({ text: 'Tapez une lettre dans le chat pour jouer !' });
        }

        function hasWon() {
            return word.split('').every(l => guessed.has(l));
        }

        const embed = buildEmbed();
        const msg = await interaction.reply({ embeds: [embed], fetchReply: true });

        const collector = interaction.channel.createMessageCollector({
            filter: m => m.author.id === interaction.user.id && /^[a-zA-ZÀ-ÿ]$/i.test(m.content.trim()),
            time: 120_000
        });

        collector.on('collect', async m => {
            const letter = m.content.trim().toUpperCase();
            m.delete().catch(() => {});

            if (guessed.has(letter)) return;
            guessed.add(letter);

            if (!word.includes(letter)) {
                lives--;
            }

            if (lives <= 0) {
                collector.stop('lost');
                const lostEmbed = buildEmbed()
                    .setDescription(HANGMAN_STAGES[6] + `\n\n💀 **Perdu !** Le mot était : **${word}**`)
                    .setColor('#FF0000');
                return msg.edit({ embeds: [lostEmbed] });
            }

            if (hasWon()) {
                collector.stop('won');
                const winEmbed = buildEmbed()
                    .setDescription(`🎉 **Félicitations !** Vous avez trouvé le mot : **${word}**`)
                    .setColor('#00FF00');
                return msg.edit({ embeds: [winEmbed] });
            }

            await msg.edit({ embeds: [buildEmbed()] });
        });

        collector.on('end', (_, reason) => {
            if (reason === 'time') {
                const timeEmbed = buildEmbed()
                    .setDescription(`⏰ Temps écoulé ! Le mot était : **${word}**`)
                    .setColor('#FF0000');
                msg.edit({ embeds: [timeEmbed] }).catch(() => {});
            }
        });
    },
};
