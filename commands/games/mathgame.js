const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { randomInt, shuffle } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mathgame')
        .setDescription('Résolvez un problème de maths le plus vite possible !'),
    cooldown: 3,
    async execute(interaction, client) {
        const ops = ['+', '-', '×'];
        const op = ops[Math.floor(Math.random() * ops.length)];

        let a, b, answer;
        switch (op) {
            case '+':
                a = randomInt(1, 100);
                b = randomInt(1, 100);
                answer = a + b;
                break;
            case '-':
                a = randomInt(10, 100);
                b = randomInt(1, a);
                answer = a - b;
                break;
            case '×':
                a = randomInt(2, 15);
                b = randomInt(2, 15);
                answer = a * b;
                break;
        }

        const wrongAnswers = new Set();
        while (wrongAnswers.size < 3) {
            const offset = randomInt(-10, 10);
            const wrong = answer + offset;
            if (wrong !== answer && wrong >= 0) wrongAnswers.add(wrong);
        }

        let choices = [answer, ...wrongAnswers];
        choices = shuffle(choices);

        const embed = new EmbedBuilder()
            .setTitle('🔢 Problème de Maths')
            .setDescription(`**${a} ${op} ${b} = ?**`)
            .setColor('#5865F2')
            .setFooter({ text: 'Vous avez 15 secondes !' });

        const row = new ActionRowBuilder().addComponents(
            choices.map((c, i) =>
                new ButtonBuilder()
                    .setCustomId(`math_${c}`)
                    .setLabel(`${c}`)
                    .setStyle(ButtonStyle.Primary)
            )
        );

        const startTime = Date.now();
        const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });
        const collector = msg.createMessageComponentCollector({ time: 15_000 });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) return i.reply({ content: 'Ce n\'est pas votre question !', ephemeral: true });
            collector.stop('answered');

            const chosen = parseInt(i.customId.split('_')[1]);
            const correct = chosen === answer;
            const timeTaken = ((Date.now() - startTime) / 1000).toFixed(1);

            const resultRow = new ActionRowBuilder().addComponents(
                choices.map(c =>
                    new ButtonBuilder()
                        .setCustomId(`math_${c}`)
                        .setLabel(`${c}`)
                        .setStyle(c === answer ? ButtonStyle.Success : (c === chosen && !correct) ? ButtonStyle.Danger : ButtonStyle.Secondary)
                        .setDisabled(true)
                )
            );

            embed.setColor(correct ? '#00FF00' : '#FF0000')
                .setDescription(`**${a} ${op} ${b} = ${answer}**\n\n${correct ? `✅ Bonne réponse en **${timeTaken}s** !` : `❌ Mauvaise réponse ! La réponse était **${answer}**`}`);

            await i.update({ embeds: [embed], components: [resultRow] });
        });

        collector.on('end', (_, reason) => {
            if (reason === 'time') {
                const timeoutRow = new ActionRowBuilder().addComponents(
                    choices.map(c =>
                        new ButtonBuilder().setCustomId(`math_${c}`).setLabel(`${c}`)
                            .setStyle(c === answer ? ButtonStyle.Success : ButtonStyle.Secondary).setDisabled(true)
                    )
                );
                embed.setColor('#FF0000').setDescription(`**${a} ${op} ${b} = ${answer}**\n\n⏰ Temps écoulé ! La réponse était **${answer}**`);
                msg.edit({ embeds: [embed], components: [timeoutRow] }).catch(() => {});
            }
        });
    },
};
