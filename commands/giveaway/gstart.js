const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database/db');
const { successEmbed, errorEmbed } = require('../../utils/functions');

function parseDuration(str) {
    const match = str.match(/^(\d+)(s|m|h|d|j)$/i);
    if (!match) return null;
    const val = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000, j: 86400000 };
    return val * (multipliers[unit] || 0);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gstart')
        .setDescription('Démarrer rapidement un giveaway via un formulaire interactif')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    cooldown: 5,
    async execute(interaction, client) {
        const modal = new ModalBuilder()
            .setCustomId('gstart_modal')
            .setTitle('🎉 Créer un Giveaway');

        const prizeInput = new TextInputBuilder()
            .setCustomId('gstart_prize')
            .setLabel('Prix du giveaway')
            .setPlaceholder('Ex: Nitro, Carte cadeau, Rôle VIP...')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const durationInput = new TextInputBuilder()
            .setCustomId('gstart_duration')
            .setLabel('Durée (ex: 1h, 30m, 1d, 2j)')
            .setPlaceholder('1h')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const winnersInput = new TextInputBuilder()
            .setCustomId('gstart_winners')
            .setLabel('Nombre de gagnants')
            .setPlaceholder('1')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setValue('1');

        modal.addComponents(
            new ActionRowBuilder().addComponents(prizeInput),
            new ActionRowBuilder().addComponents(durationInput),
            new ActionRowBuilder().addComponents(winnersInput)
        );

        await interaction.showModal(modal);

        try {
            const modalInteraction = await interaction.awaitModalSubmit({ time: 120_000 });

            const prize = modalInteraction.fields.getTextInputValue('gstart_prize');
            const durationStr = modalInteraction.fields.getTextInputValue('gstart_duration');
            const winnersStr = modalInteraction.fields.getTextInputValue('gstart_winners');
            const winners = parseInt(winnersStr);

            if (isNaN(winners) || winners < 1 || winners > 20) {
                return modalInteraction.reply({ embeds: [errorEmbed('Le nombre de gagnants doit être entre 1 et 20 !')], ephemeral: true });
            }

            const duration = parseDuration(durationStr);
            if (!duration) {
                return modalInteraction.reply({ embeds: [errorEmbed('Format de durée invalide ! Utilisez : `1s`, `30m`, `1h`, `1d`, `2j`')], ephemeral: true });
            }

            const endTime = Date.now() + duration;
            const endTimestamp = Math.floor(endTime / 1000);
            const channel = interaction.channel;

            const embed = new EmbedBuilder()
                .setTitle('🎉 GIVEAWAY 🎉')
                .setDescription(`**${prize}**\n\nCliquez sur le bouton pour participer !\n\n⏰ Fin : <t:${endTimestamp}:R>\n🏆 Gagnant(s) : **${winners}**\n🎫 Participants : **0**\n👤 Organisé par : ${interaction.user}`)
                .setColor('#FF69B4')
                .setTimestamp(new Date(endTime))
                .setFooter({ text: `${winners} gagnant(s) | Fin` });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('giveaway_join')
                    .setLabel('🎉 Participer (0)')
                    .setStyle(ButtonStyle.Success)
            );

            const msg = await channel.send({ embeds: [embed], components: [row] });

            const entry = db.createGiveaway(interaction.guild.id, channel.id, msg.id, interaction.user.id, prize, winners, endTime);

            await modalInteraction.reply({
                embeds: [successEmbed(`Giveaway créé ! 🎉\n\n**Prix :** ${prize}\n**Durée :** ${durationStr}\n**Gagnants :** ${winners}`)],
                ephemeral: true
            });

            const collector = msg.createMessageComponentCollector({
                filter: i => i.customId === 'giveaway_join',
                time: duration
            });

            const participants = new Set();

            collector.on('collect', async i => {
                if (participants.has(i.user.id)) {
                    participants.delete(i.user.id);
                    await i.reply({ content: '❌ Vous avez quitté le giveaway !', ephemeral: true });
                } else {
                    participants.add(i.user.id);
                    await i.reply({ content: '✅ Vous participez au giveaway !', ephemeral: true });
                }

                const newRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('giveaway_join')
                        .setLabel(`🎉 Participer (${participants.size})`)
                        .setStyle(ButtonStyle.Success)
                );

                embed.setDescription(`**${prize}**\n\nCliquez sur le bouton pour participer !\n\n⏰ Fin : <t:${endTimestamp}:R>\n🏆 Gagnant(s) : **${winners}**\n🎫 Participants : **${participants.size}**\n👤 Organisé par : ${interaction.user}`);
                await msg.edit({ embeds: [embed], components: [newRow] });
                db.updateGiveaway(entry.id, { participants: [...participants] });
            });

            collector.on('end', async () => {
                const participantArray = [...participants];
                const pool = [...participantArray];
                const winnerList = [];

                for (let i = 0; i < Math.min(winners, pool.length); i++) {
                    const idx = Math.floor(Math.random() * pool.length);
                    winnerList.push(pool.splice(idx, 1)[0]);
                }

                const disabledRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('giveaway_join')
                        .setLabel(`🎉 Terminé (${participants.size})`)
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true)
                );

                if (winnerList.length === 0) {
                    embed.setDescription(`**${prize}**\n\n❌ Pas assez de participants.`).setColor('#FF0000');
                } else {
                    const winnerMentions = winnerList.map(id => `<@${id}>`).join(', ');
                    embed.setDescription(`**${prize}**\n\n🎉 **Gagnant(s) :** ${winnerMentions}\n👤 Organisé par : ${interaction.user}`).setColor('#00FF00');
                    channel.send(`🎉 Félicitations ${winnerMentions} ! Vous avez gagné **${prize}** !`);
                }

                await msg.edit({ embeds: [embed], components: [disabledRow] });
                db.updateGiveaway(entry.id, { ended: 1 });
            });
        } catch {
            // Modal timed out
        }
    },
};
