const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const EMOJIS = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🥝', '🍑'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('memory')
        .setDescription('Jeu de mémoire - Trouvez toutes les paires d\'émojis'),
    cooldown: 10,
    async execute(interaction, client) {
        const pairs = EMOJIS.slice(0, 8);
        let cards = [...pairs, ...pairs];
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }

        const revealed = Array(16).fill(false);
        const matched = Array(16).fill(false);
        let firstPick = null;
        let pairsFound = 0;
        let moves = 0;
        let locked = false;

        function buildBoard(showAll = false) {
            const rows = [];
            for (let r = 0; r < 4; r++) {
                const row = new ActionRowBuilder();
                for (let c = 0; c < 4; c++) {
                    const idx = r * 4 + c;
                    const show = showAll || revealed[idx] || matched[idx];
                    row.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`mem_${idx}`)
                            .setLabel(show ? cards[idx] : '❓')
                            .setStyle(matched[idx] ? ButtonStyle.Success : revealed[idx] ? ButtonStyle.Primary : ButtonStyle.Secondary)
                            .setDisabled(matched[idx] || locked)
                    );
                }
                rows.push(row);
            }
            return rows;
        }

        function buildEmbed(status = null) {
            return new EmbedBuilder()
                .setTitle('🧠 Jeu de Mémoire')
                .setDescription(status || 'Cliquez sur une carte pour la retourner !')
                .addFields(
                    { name: '🎯 Paires trouvées', value: `${pairsFound}/8`, inline: true },
                    { name: '📊 Coups joués', value: `${moves}`, inline: true }
                )
                .setColor('#5865F2');
        }

        const msg = await interaction.reply({ embeds: [buildEmbed()], components: buildBoard(), fetchReply: true });
        const collector = msg.createMessageComponentCollector({ time: 180_000 });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) return i.reply({ content: 'Ce n\'est pas votre partie !', ephemeral: true });
            if (locked) return i.deferUpdate();

            const idx = parseInt(i.customId.split('_')[1]);
            if (matched[idx] || revealed[idx]) return i.deferUpdate();

            revealed[idx] = true;

            if (firstPick === null) {
                firstPick = idx;
                await i.update({ embeds: [buildEmbed()], components: buildBoard() });
            } else {
                moves++;
                locked = true;

                if (cards[firstPick] === cards[idx]) {
                    matched[firstPick] = true;
                    matched[idx] = true;
                    revealed[firstPick] = false;
                    revealed[idx] = false;
                    pairsFound++;
                    firstPick = null;
                    locked = false;

                    if (pairsFound === 8) {
                        collector.stop('won');
                        return i.update({
                            embeds: [buildEmbed(`🎉 **Félicitations !** Toutes les paires trouvées en **${moves}** coups !`).setColor('#00FF00')],
                            components: buildBoard(true)
                        });
                    }

                    await i.update({ embeds: [buildEmbed(`✅ Paire trouvée !`)], components: buildBoard() });
                } else {
                    await i.update({ embeds: [buildEmbed('❌ Pas une paire ! Les cartes se retournent...')], components: buildBoard() });

                    setTimeout(async () => {
                        revealed[firstPick] = false;
                        revealed[idx] = false;
                        firstPick = null;
                        locked = false;
                        await msg.edit({ embeds: [buildEmbed()], components: buildBoard() }).catch(() => {});
                    }, 1500);
                }
            }
        });

        collector.on('end', (_, reason) => {
            if (reason === 'time') {
                msg.edit({
                    embeds: [buildEmbed('⏰ Temps écoulé ! Partie terminée.').setColor('#FF0000')],
                    components: buildBoard(true)
                }).catch(() => {});
            }
        });
    },
};
