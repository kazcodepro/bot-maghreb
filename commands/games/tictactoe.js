const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tictactoe')
        .setDescription('Jouer au Morpion contre un autre joueur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur contre qui jouer')
                .setRequired(true)),
    cooldown: 10,
    async execute(interaction, client) {
        const opponent = interaction.options.getUser('utilisateur');
        if (opponent.bot) return interaction.reply({ embeds: [errorEmbed('Vous ne pouvez pas jouer contre un bot !')], ephemeral: true });
        if (opponent.id === interaction.user.id) return interaction.reply({ embeds: [errorEmbed('Vous ne pouvez pas jouer contre vous-même !')], ephemeral: true });

        const board = Array(9).fill(null);
        let currentPlayer = interaction.user;
        const players = { [interaction.user.id]: '❌', [opponent.id]: '⭕' };

        function buildBoard(disabled = false) {
            const rows = [];
            for (let r = 0; r < 3; r++) {
                const row = new ActionRowBuilder();
                for (let c = 0; c < 3; c++) {
                    const idx = r * 3 + c;
                    const val = board[idx];
                    row.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`ttt_${idx}`)
                            .setLabel(val || '⬜')
                            .setStyle(val === '❌' ? ButtonStyle.Danger : val === '⭕' ? ButtonStyle.Primary : ButtonStyle.Secondary)
                            .setDisabled(disabled || val !== null)
                    );
                }
                rows.push(row);
            }
            return rows;
        }

        function checkWin() {
            const lines = [
                [0,1,2],[3,4,5],[6,7,8],
                [0,3,6],[1,4,7],[2,5,8],
                [0,4,8],[2,4,6]
            ];
            for (const [a, b, c] of lines) {
                if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
            }
            return board.every(v => v !== null) ? 'draw' : null;
        }

        const embed = new EmbedBuilder()
            .setTitle('🎮 Morpion')
            .setDescription(`C'est au tour de ${currentPlayer} (${players[currentPlayer.id]})`)
            .setColor('#5865F2')
            .addFields(
                { name: 'Joueur 1', value: `${interaction.user} ❌`, inline: true },
                { name: 'Joueur 2', value: `${opponent} ⭕`, inline: true }
            );

        const msg = await interaction.reply({ embeds: [embed], components: buildBoard(), fetchReply: true });

        const collector = msg.createMessageComponentCollector({ time: 120_000 });

        collector.on('collect', async i => {
            if (i.user.id !== currentPlayer.id) {
                return i.reply({ content: 'Ce n\'est pas votre tour !', ephemeral: true });
            }

            const idx = parseInt(i.customId.split('_')[1]);
            if (board[idx] !== null) return i.reply({ content: 'Cette case est déjà prise !', ephemeral: true });

            board[idx] = players[currentPlayer.id];
            const winner = checkWin();

            if (winner) {
                collector.stop();
                let desc;
                if (winner === 'draw') {
                    desc = '🤝 Match nul !';
                } else {
                    desc = `🎉 ${currentPlayer} (${winner}) a gagné !`;
                }
                embed.setDescription(desc).setColor(winner === 'draw' ? '#FFA500' : '#00FF00');
                return i.update({ embeds: [embed], components: buildBoard(true) });
            }

            currentPlayer = currentPlayer.id === interaction.user.id ? opponent : interaction.user;
            embed.setDescription(`C'est au tour de ${currentPlayer} (${players[currentPlayer.id]})`);
            await i.update({ embeds: [embed], components: buildBoard() });
        });

        collector.on('end', (_, reason) => {
            if (reason === 'time') {
                embed.setDescription('⏰ Temps écoulé ! Partie annulée.').setColor('#FF0000');
                msg.edit({ embeds: [embed], components: buildBoard(true) }).catch(() => {});
            }
        });
    },
};
