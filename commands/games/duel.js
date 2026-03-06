const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('duel')
        .setDescription('Défiez un autre joueur en duel !')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à défier')
                .setRequired(true)),
    cooldown: 10,
    async execute(interaction, client) {
        const opponent = interaction.options.getUser('utilisateur');
        if (opponent.bot) return interaction.reply({ embeds: [errorEmbed('Vous ne pouvez pas défier un bot !')], ephemeral: true });
        if (opponent.id === interaction.user.id) return interaction.reply({ embeds: [errorEmbed('Vous ne pouvez pas vous défier vous-même !')], ephemeral: true });

        const players = {
            [interaction.user.id]: { user: interaction.user, hp: 100, shield: false },
            [opponent.id]: { user: opponent, hp: 100, shield: false }
        };
        let currentId = interaction.user.id;

        function buildButtons(disabled = false) {
            return [new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('duel_attack').setLabel('⚔️ Attaquer').setStyle(ButtonStyle.Danger).setDisabled(disabled),
                new ButtonBuilder().setCustomId('duel_defend').setLabel('🛡️ Défendre').setStyle(ButtonStyle.Primary).setDisabled(disabled),
                new ButtonBuilder().setCustomId('duel_dodge').setLabel('💨 Esquiver').setStyle(ButtonStyle.Secondary).setDisabled(disabled)
            )];
        }

        function buildEmbed(action = null) {
            const p1 = players[interaction.user.id];
            const p2 = players[opponent.id];
            const hpBar = (hp) => {
                const filled = Math.round(hp / 10);
                return '🟩'.repeat(filled) + '⬛'.repeat(10 - filled) + ` ${hp}/100`;
            };

            const embed = new EmbedBuilder()
                .setTitle('⚔️ Duel')
                .addFields(
                    { name: `${p1.user.username}`, value: hpBar(p1.hp), inline: false },
                    { name: `${p2.user.username}`, value: hpBar(p2.hp), inline: false }
                )
                .setColor('#5865F2');

            if (action) embed.setDescription(action);
            else embed.setDescription(`C'est au tour de <@${currentId}> !`);

            embed.setFooter({ text: `Tour de ${players[currentId].user.username}` });
            return embed;
        }

        const msg = await interaction.reply({ embeds: [buildEmbed()], components: buildButtons(), fetchReply: true });
        const collector = msg.createMessageComponentCollector({ time: 120_000 });

        collector.on('collect', async i => {
            if (i.user.id !== currentId) return i.reply({ content: 'Ce n\'est pas votre tour !', ephemeral: true });

            const attacker = players[currentId];
            const defenderId = currentId === interaction.user.id ? opponent.id : interaction.user.id;
            const defender = players[defenderId];
            let actionText = '';

            attacker.shield = false;

            if (i.customId === 'duel_attack') {
                let dmg = Math.floor(Math.random() * 20) + 10;
                if (defender.shield) {
                    dmg = Math.floor(dmg * 0.3);
                    actionText = `⚔️ **${attacker.user.username}** attaque ! Mais **${defender.user.username}** se défend ! (-${dmg} PV)`;
                } else {
                    actionText = `⚔️ **${attacker.user.username}** attaque **${defender.user.username}** ! (-${dmg} PV)`;
                }
                defender.hp = Math.max(0, defender.hp - dmg);
            } else if (i.customId === 'duel_defend') {
                attacker.shield = true;
                actionText = `🛡️ **${attacker.user.username}** se met en position de défense !`;
            } else if (i.customId === 'duel_dodge') {
                const success = Math.random() < 0.4;
                if (success) {
                    attacker.shield = true;
                    actionText = `💨 **${attacker.user.username}** se prépare à esquiver !`;
                } else {
                    actionText = `💨 **${attacker.user.username}** tente d'esquiver... mais trébuche !`;
                }
            }

            if (defender.hp <= 0) {
                collector.stop();
                const winEmbed = buildEmbed(`${actionText}\n\n🏆 **${attacker.user.username}** remporte le duel !`)
                    .setColor('#00FF00');
                return i.update({ embeds: [winEmbed], components: buildButtons(true) });
            }

            currentId = defenderId;
            const turnEmbed = buildEmbed(`${actionText}\n\nC'est au tour de <@${currentId}> !`);
            await i.update({ embeds: [turnEmbed], components: buildButtons() });
        });

        collector.on('end', (_, reason) => {
            if (reason === 'time') {
                const embed = buildEmbed('⏰ Temps écoulé ! Le duel est annulé.').setColor('#FF0000');
                msg.edit({ embeds: [embed], components: buildButtons(true) }).catch(() => {});
            }
        });
    },
};
