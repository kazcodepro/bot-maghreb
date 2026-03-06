const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { errorEmbed } = require('../../utils/functions');

const ROWS = 6;
const COLS = 7;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('connect4')
        .setDescription('Jouer au Puissance 4 contre un autre joueur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur contre qui jouer')
                .setRequired(true)),
    cooldown: 10,
    async execute(interaction, client) {
        const opponent = interaction.options.getUser('utilisateur');
        if (opponent.bot) return interaction.reply({ embeds: [errorEmbed('Vous ne pouvez pas jouer contre un bot !')], ephemeral: true });
        if (opponent.id === interaction.user.id) return interaction.reply({ embeds: [errorEmbed('Vous ne pouvez pas jouer contre vous-même !')], ephemeral: true });

        const board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
        let currentPlayer = interaction.user;
        const players = { [interaction.user.id]: 1, [opponent.id]: 2 };
        const emojis = { 0: '⚪', 1: '🔴', 2: '🟡' };

        function renderBoard() {
            let str = '';
            for (let r = 0; r < ROWS; r++) {
                str += board[r].map(c => emojis[c]).join('') + '\n';
            }
            str += '1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣';
            return str;
        }

        function dropPiece(col, player) {
            for (let r = ROWS - 1; r >= 0; r--) {
                if (board[r][col] === 0) {
                    board[r][col] = player;
                    return r;
                }
            }
            return -1;
        }

        function checkWin(row, col, player) {
            const directions = [[0,1],[1,0],[1,1],[1,-1]];
            for (const [dr, dc] of directions) {
                let count = 1;
                for (let d = 1; d <= 3; d++) {
                    const nr = row + dr * d, nc = col + dc * d;
                    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc] === player) count++;
                    else break;
                }
                for (let d = 1; d <= 3; d++) {
                    const nr = row - dr * d, nc = col - dc * d;
                    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc] === player) count++;
                    else break;
                }
                if (count >= 4) return true;
            }
            return false;
        }

        function isFull() {
            return board[0].every(c => c !== 0);
        }

        function buildButtons(disabled = false) {
            const row = new ActionRowBuilder();
            for (let c = 0; c < COLS; c++) {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`c4_${c}`)
                        .setLabel(`${c + 1}`)
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(disabled || board[0][c] !== 0)
                );
            }
            return [row];
        }

        const embed = new EmbedBuilder()
            .setTitle('🔴🟡 Puissance 4')
            .setDescription(`${renderBoard()}\n\nC'est au tour de ${currentPlayer} (${emojis[players[currentPlayer.id]]})`)
            .setColor('#5865F2')
            .addFields(
                { name: 'Joueur 1', value: `${interaction.user} 🔴`, inline: true },
                { name: 'Joueur 2', value: `${opponent} 🟡`, inline: true }
            );

        const msg = await interaction.reply({ embeds: [embed], components: buildButtons(), fetchReply: true });

        const collector = msg.createMessageComponentCollector({ time: 180_000 });

        collector.on('collect', async i => {
            if (i.user.id !== currentPlayer.id) {
                return i.reply({ content: 'Ce n\'est pas votre tour !', ephemeral: true });
            }

            const col = parseInt(i.customId.split('_')[1]);
            const playerNum = players[currentPlayer.id];
            const row = dropPiece(col, playerNum);

            if (row === -1) return i.reply({ content: 'Cette colonne est pleine !', ephemeral: true });

            if (checkWin(row, col, playerNum)) {
                collector.stop();
                embed.setDescription(`${renderBoard()}\n\n🎉 ${currentPlayer} (${emojis[playerNum]}) a gagné !`)
                    .setColor('#00FF00');
                return i.update({ embeds: [embed], components: buildButtons(true) });
            }

            if (isFull()) {
                collector.stop();
                embed.setDescription(`${renderBoard()}\n\n🤝 Match nul !`)
                    .setColor('#FFA500');
                return i.update({ embeds: [embed], components: buildButtons(true) });
            }

            currentPlayer = currentPlayer.id === interaction.user.id ? opponent : interaction.user;
            embed.setDescription(`${renderBoard()}\n\nC'est au tour de ${currentPlayer} (${emojis[players[currentPlayer.id]]})`);
            await i.update({ embeds: [embed], components: buildButtons() });
        });

        collector.on('end', (_, reason) => {
            if (reason === 'time') {
                embed.setDescription(`${renderBoard()}\n\n⏰ Temps écoulé ! Partie annulée.`).setColor('#FF0000');
                msg.edit({ embeds: [embed], components: buildButtons(true) }).catch(() => {});
            }
        });
    },
};
