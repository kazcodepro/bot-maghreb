const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const WIDTH = 8;
const HEIGHT = 8;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('snake')
        .setDescription('Jouez au Snake avec des boutons directionnels'),
    cooldown: 10,
    async execute(interaction, client) {
        let snake = [{ x: 4, y: 4 }];
        let direction = { x: 0, y: -1 };
        let food = spawnFood();
        let score = 0;
        let gameOver = false;

        function spawnFood() {
            let pos;
            do {
                pos = { x: Math.floor(Math.random() * WIDTH), y: Math.floor(Math.random() * HEIGHT) };
            } while (snake.some(s => s.x === pos.x && s.y === pos.y));
            return pos;
        }

        function renderGrid() {
            let grid = '';
            for (let y = 0; y < HEIGHT; y++) {
                for (let x = 0; x < WIDTH; x++) {
                    const isHead = snake[0].x === x && snake[0].y === y;
                    const isBody = snake.slice(1).some(s => s.x === x && s.y === y);
                    const isFood = food.x === x && food.y === y;
                    if (isHead) grid += '🟩';
                    else if (isBody) grid += '🟢';
                    else if (isFood) grid += '🍎';
                    else grid += '⬛';
                }
                grid += '\n';
            }
            return grid;
        }

        function move() {
            const newHead = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

            if (newHead.x < 0 || newHead.x >= WIDTH || newHead.y < 0 || newHead.y >= HEIGHT) return false;
            if (snake.some(s => s.x === newHead.x && s.y === newHead.y)) return false;

            snake.unshift(newHead);

            if (newHead.x === food.x && newHead.y === food.y) {
                score++;
                food = spawnFood();
            } else {
                snake.pop();
            }
            return true;
        }

        function buildButtons(disabled = false) {
            const emptyBtn = () => new ButtonBuilder().setCustomId(`snake_empty_${Math.random()}`).setLabel('⬜').setStyle(ButtonStyle.Secondary).setDisabled(true);
            return [
                new ActionRowBuilder().addComponents(
                    emptyBtn(),
                    new ButtonBuilder().setCustomId('snake_up').setEmoji('⬆️').setStyle(ButtonStyle.Primary).setDisabled(disabled),
                    emptyBtn()
                ),
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('snake_left').setEmoji('⬅️').setStyle(ButtonStyle.Primary).setDisabled(disabled),
                    new ButtonBuilder().setCustomId('snake_down').setEmoji('⬇️').setStyle(ButtonStyle.Primary).setDisabled(disabled),
                    new ButtonBuilder().setCustomId('snake_right').setEmoji('➡️').setStyle(ButtonStyle.Primary).setDisabled(disabled)
                )
            ];
        }

        function buildEmbed(status = null) {
            return new EmbedBuilder()
                .setTitle('🐍 Snake')
                .setDescription(`${renderGrid()}${status ? `\n${status}` : ''}`)
                .addFields({ name: '🍎 Score', value: `${score}`, inline: true })
                .setColor(gameOver ? '#FF0000' : '#00FF00')
                .setFooter({ text: 'Utilisez les boutons pour diriger le serpent !' });
        }

        const msg = await interaction.reply({ embeds: [buildEmbed()], components: buildButtons(), fetchReply: true });
        const collector = msg.createMessageComponentCollector({ time: 120_000 });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) return i.reply({ content: 'Ce n\'est pas votre partie !', ephemeral: true });
            if (gameOver) return i.deferUpdate();

            const dir = i.customId.replace('snake_', '');
            const dirs = {
                up: { x: 0, y: -1 },
                down: { x: 0, y: 1 },
                left: { x: -1, y: 0 },
                right: { x: 1, y: 0 }
            };

            if (!dirs[dir]) return i.deferUpdate();

            if (direction.x + dirs[dir].x === 0 && direction.y + dirs[dir].y === 0 && snake.length > 1) {
                return i.deferUpdate();
            }

            direction = dirs[dir];

            if (!move()) {
                gameOver = true;
                collector.stop('gameover');
                return i.update({ embeds: [buildEmbed(`💀 **Game Over !** Score final : **${score}**`)], components: buildButtons(true) });
            }

            await i.update({ embeds: [buildEmbed()], components: buildButtons() });
        });

        collector.on('end', (_, reason) => {
            if (reason === 'time') {
                gameOver = true;
                msg.edit({ embeds: [buildEmbed('⏰ Temps écoulé ! Partie terminée.')], components: buildButtons(true) }).catch(() => {});
            }
        });
    },
};
