const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const WORDS = [
    'POMME', 'TIGRE', 'PLAGE', 'NUAGE', 'ARBRE', 'FLEUR', 'HERBE',
    'ROUGE', 'BLANC', 'VERRE', 'PORTE', 'CHIEN', 'FORTE', 'LAMPE',
    'MONDE', 'TERRE', 'TABLE', 'SUCRE', 'POULE', 'FILLE', 'REINE',
    'POIRE', 'LINGE', 'MARGE', 'PECHE', 'SABLE', 'COUPE', 'FORME',
    'LIGNE', 'BRISE', 'MERCI', 'PILOT', 'LOUVE', 'SINGE', 'BAGUE'
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wordle')
        .setDescription('Jeu de Wordle en français - Devinez le mot de 5 lettres en 6 essais'),
    cooldown: 10,
    async execute(interaction, client) {
        const target = WORDS[Math.floor(Math.random() * WORDS.length)];
        let attempts = 6;
        const history = [];

        function evaluate(guess) {
            const result = [];
            const targetArr = target.split('');
            const guessArr = guess.split('');
            const used = Array(5).fill(false);

            for (let i = 0; i < 5; i++) {
                if (guessArr[i] === targetArr[i]) {
                    result[i] = '🟩';
                    used[i] = true;
                } else {
                    result[i] = null;
                }
            }

            for (let i = 0; i < 5; i++) {
                if (result[i]) continue;
                const foundIdx = targetArr.findIndex((l, j) => l === guessArr[i] && !used[j] && result[j] !== '🟩');
                if (foundIdx !== -1) {
                    result[i] = '🟨';
                    used[foundIdx] = true;
                } else {
                    result[i] = '⬛';
                }
            }

            return result;
        }

        function buildEmbed() {
            const desc = history.length > 0
                ? history.map(h => `${h.result.join('')}  ${h.word.split('').join(' ')}`).join('\n')
                : 'Tapez un mot de 5 lettres dans le chat !';

            return new EmbedBuilder()
                .setTitle('📝 Wordle')
                .setDescription(desc)
                .addFields({ name: '📊 Essais restants', value: `${attempts}/6` })
                .setColor('#5865F2')
                .setFooter({ text: 'Tapez un mot de 5 lettres pour deviner !' });
        }

        const msg = await interaction.reply({ embeds: [buildEmbed()], fetchReply: true });

        const collector = interaction.channel.createMessageCollector({
            filter: m => m.author.id === interaction.user.id && /^[a-zA-ZÀ-ÿ]{5}$/i.test(m.content.trim()),
            time: 180_000
        });

        collector.on('collect', async m => {
            const guess = m.content.trim().toUpperCase();
            m.delete().catch(() => {});

            const result = evaluate(guess);
            history.push({ word: guess, result });
            attempts--;

            if (guess === target) {
                collector.stop('won');
                const winEmbed = buildEmbed()
                    .setTitle('📝 Wordle - Gagné !')
                    .setDescription(history.map(h => `${h.result.join('')}  ${h.word.split('').join(' ')}`).join('\n') + `\n\n🎉 **Bravo !** Trouvé en **${history.length}** essai(s) !`)
                    .setColor('#00FF00')
                    .setFields();
                return msg.edit({ embeds: [winEmbed] });
            }

            if (attempts <= 0) {
                collector.stop('lost');
                const loseEmbed = buildEmbed()
                    .setTitle('📝 Wordle - Perdu !')
                    .setDescription(history.map(h => `${h.result.join('')}  ${h.word.split('').join(' ')}`).join('\n') + `\n\n💀 Le mot était : **${target}**`)
                    .setColor('#FF0000')
                    .setFields();
                return msg.edit({ embeds: [loseEmbed] });
            }

            await msg.edit({ embeds: [buildEmbed()] });
        });

        collector.on('end', (_, reason) => {
            if (reason === 'time') {
                const embed = buildEmbed()
                    .setDescription(history.map(h => `${h.result.join('')}  ${h.word.split('').join(' ')}`).join('\n') + `\n\n⏰ Temps écoulé ! Le mot était : **${target}**`)
                    .setColor('#FF0000');
                msg.edit({ embeds: [embed] }).catch(() => {});
            }
        });
    },
};
