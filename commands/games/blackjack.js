const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const SUITS = ['♠️', '♥️', '♦️', '♣️'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blackjack')
        .setDescription('Jouer au Blackjack contre le croupier'),
    cooldown: 5,
    async execute(interaction, client) {
        const deck = [];
        for (const suit of SUITS) {
            for (const val of VALUES) {
                deck.push({ suit, val });
            }
        }
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        function cardValue(hand) {
            let total = 0;
            let aces = 0;
            for (const card of hand) {
                if (card.val === 'A') { total += 11; aces++; }
                else if (['J', 'Q', 'K'].includes(card.val)) total += 10;
                else total += parseInt(card.val);
            }
            while (total > 21 && aces > 0) { total -= 10; aces--; }
            return total;
        }

        function cardStr(card) { return `\`${card.val}${card.suit}\``; }
        function handStr(hand) { return hand.map(cardStr).join(' '); }

        const playerHand = [deck.pop(), deck.pop()];
        const dealerHand = [deck.pop(), deck.pop()];

        function buildEmbed(reveal = false, result = null) {
            const playerTotal = cardValue(playerHand);
            const dealerTotal = cardValue(dealerHand);

            const embed = new EmbedBuilder()
                .setTitle('🃏 Blackjack')
                .addFields(
                    { name: `Vos cartes (${playerTotal})`, value: handStr(playerHand), inline: false },
                    { name: `Croupier (${reveal ? dealerTotal : '?'})`, value: reveal ? handStr(dealerHand) : `${cardStr(dealerHand[0])} \`??\``, inline: false }
                )
                .setColor('#5865F2');

            if (result) {
                embed.setDescription(result);
                embed.setColor(result.includes('gagné') ? '#00FF00' : result.includes('nul') ? '#FFA500' : '#FF0000');
            }

            return embed;
        }

        function buildButtons(disabled = false) {
            return [new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('bj_hit').setLabel('🎴 Tirer').setStyle(ButtonStyle.Primary).setDisabled(disabled),
                new ButtonBuilder().setCustomId('bj_stand').setLabel('✋ Rester').setStyle(ButtonStyle.Secondary).setDisabled(disabled)
            )];
        }

        if (cardValue(playerHand) === 21) {
            const embed = buildEmbed(true, '🎉 **Blackjack !** Vous avez gagné !');
            return interaction.reply({ embeds: [embed], components: buildButtons(true) });
        }

        const msg = await interaction.reply({ embeds: [buildEmbed()], components: buildButtons(), fetchReply: true });

        const collector = msg.createMessageComponentCollector({ time: 60_000 });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) return i.reply({ content: 'Ce n\'est pas votre partie !', ephemeral: true });

            if (i.customId === 'bj_hit') {
                playerHand.push(deck.pop());
                const total = cardValue(playerHand);

                if (total > 21) {
                    collector.stop();
                    return i.update({ embeds: [buildEmbed(true, `💀 **Bust !** Vous avez dépassé 21 (${total}). Vous avez perdu !`)], components: buildButtons(true) });
                }
                if (total === 21) {
                    collector.stop();
                    return i.update({ embeds: [buildEmbed(true, '🎉 **21 !** Vous avez gagné !')], components: buildButtons(true) });
                }
                return i.update({ embeds: [buildEmbed()], components: buildButtons() });
            }

            if (i.customId === 'bj_stand') {
                collector.stop();
                while (cardValue(dealerHand) < 17) dealerHand.push(deck.pop());

                const playerTotal = cardValue(playerHand);
                const dealerTotal = cardValue(dealerHand);
                let result;

                if (dealerTotal > 21) result = `🎉 Le croupier a bust (${dealerTotal}) ! Vous avez gagné !`;
                else if (playerTotal > dealerTotal) result = `🎉 Vous avez gagné ! (${playerTotal} vs ${dealerTotal})`;
                else if (playerTotal < dealerTotal) result = `😢 Vous avez perdu ! (${playerTotal} vs ${dealerTotal})`;
                else result = `🤝 Match nul ! (${playerTotal} vs ${dealerTotal})`;

                return i.update({ embeds: [buildEmbed(true, result)], components: buildButtons(true) });
            }
        });

        collector.on('end', (_, reason) => {
            if (reason === 'time') {
                msg.edit({ embeds: [buildEmbed(true, '⏰ Temps écoulé ! Partie annulée.')], components: buildButtons(true) }).catch(() => {});
            }
        });
    },
};
