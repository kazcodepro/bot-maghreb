const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chifoumi')
        .setDescription('Pierre Papier Ciseaux contre un autre joueur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à défier')
                .setRequired(true)),
    cooldown: 5,
    async execute(interaction, client) {
        const opponent = interaction.options.getUser('utilisateur');
        if (opponent.bot) return interaction.reply({ embeds: [errorEmbed('Vous ne pouvez pas défier un bot !')], ephemeral: true });
        if (opponent.id === interaction.user.id) return interaction.reply({ embeds: [errorEmbed('Vous ne pouvez pas jouer contre vous-même !')], ephemeral: true });

        const choices = {};
        const emojis = { pierre: '🪨', papier: '📄', ciseaux: '✂️' };

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('chi_pierre').setLabel('🪨 Pierre').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('chi_papier').setLabel('📄 Papier').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('chi_ciseaux').setLabel('✂️ Ciseaux').setStyle(ButtonStyle.Primary)
        );

        const embed = new EmbedBuilder()
            .setTitle('✊ Chifoumi')
            .setDescription(`${interaction.user} défie ${opponent} !\n\nChacun doit cliquer sur son choix (le choix est caché) !`)
            .setColor('#5865F2')
            .addFields(
                { name: interaction.user.username, value: '⏳ En attente...', inline: true },
                { name: opponent.username, value: '⏳ En attente...', inline: true }
            )
            .setFooter({ text: 'Vous avez 30 secondes !' });

        const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });
        const collector = msg.createMessageComponentCollector({ time: 30_000 });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id && i.user.id !== opponent.id) {
                return i.reply({ content: 'Vous ne participez pas à ce duel !', ephemeral: true });
            }

            if (choices[i.user.id]) return i.reply({ content: 'Vous avez déjà fait votre choix !', ephemeral: true });

            const choice = i.customId.replace('chi_', '');
            choices[i.user.id] = choice;

            await i.reply({ content: `Vous avez choisi : ${emojis[choice]} **${choice}** !`, ephemeral: true });

            const p1Status = choices[interaction.user.id] ? '✅ Prêt' : '⏳ En attente...';
            const p2Status = choices[opponent.id] ? '✅ Prêt' : '⏳ En attente...';
            embed.setFields(
                { name: interaction.user.username, value: p1Status, inline: true },
                { name: opponent.username, value: p2Status, inline: true }
            );
            await msg.edit({ embeds: [embed] });

            if (choices[interaction.user.id] && choices[opponent.id]) {
                collector.stop('done');
                const c1 = choices[interaction.user.id];
                const c2 = choices[opponent.id];

                let result, color;
                if (c1 === c2) {
                    result = '🤝 **Égalité !**';
                    color = '#FFA500';
                } else if (
                    (c1 === 'pierre' && c2 === 'ciseaux') ||
                    (c1 === 'papier' && c2 === 'pierre') ||
                    (c1 === 'ciseaux' && c2 === 'papier')
                ) {
                    result = `🎉 **${interaction.user.username}** a gagné !`;
                    color = '#00FF00';
                } else {
                    result = `🎉 **${opponent.username}** a gagné !`;
                    color = '#00FF00';
                }

                const disabledRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('chi_pierre').setLabel('🪨 Pierre').setStyle(ButtonStyle.Secondary).setDisabled(true),
                    new ButtonBuilder().setCustomId('chi_papier').setLabel('📄 Papier').setStyle(ButtonStyle.Secondary).setDisabled(true),
                    new ButtonBuilder().setCustomId('chi_ciseaux').setLabel('✂️ Ciseaux').setStyle(ButtonStyle.Secondary).setDisabled(true)
                );

                embed.setDescription(`${result}\n\n${interaction.user.username} : ${emojis[c1]} ${c1}\n${opponent.username} : ${emojis[c2]} ${c2}`)
                    .setColor(color)
                    .setFields();
                await msg.edit({ embeds: [embed], components: [disabledRow] });
            }
        });

        collector.on('end', (_, reason) => {
            if (reason === 'time') {
                const disabledRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('chi_pierre').setLabel('🪨 Pierre').setStyle(ButtonStyle.Secondary).setDisabled(true),
                    new ButtonBuilder().setCustomId('chi_papier').setLabel('📄 Papier').setStyle(ButtonStyle.Secondary).setDisabled(true),
                    new ButtonBuilder().setCustomId('chi_ciseaux').setLabel('✂️ Ciseaux').setStyle(ButtonStyle.Secondary).setDisabled(true)
                );
                embed.setDescription('⏰ Temps écoulé ! Un des joueurs n\'a pas répondu.').setColor('#FF0000');
                msg.edit({ embeds: [embed], components: [disabledRow] }).catch(() => {});
            }
        });
    },
};
