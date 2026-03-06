const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } = require('discord.js');
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
        .setName('gcreate')
        .setDescription('Créer un giveaway')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption(option =>
            option.setName('prix')
                .setDescription('Le prix du giveaway')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('durée')
                .setDescription('Durée du giveaway (ex: 1h, 30m, 1d, 2j)')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('gagnants')
                .setDescription('Nombre de gagnants')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(20))
        .addChannelOption(option =>
            option.setName('salon')
                .setDescription('Salon où envoyer le giveaway')
                .addChannelTypes(ChannelType.GuildText)),
    cooldown: 5,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const prize = interaction.options.getString('prix');
        const durationStr = interaction.options.getString('durée');
        const winners = interaction.options.getInteger('gagnants');
        const channel = interaction.options.getChannel('salon') || interaction.channel;

        const duration = parseDuration(durationStr);
        if (!duration) {
            return interaction.reply({ embeds: [errorEmbed('Format de durée invalide ! Utilisez : `1s`, `30m`, `1h`, `1d`, `2j`')], ephemeral: true });
        }

        const endTime = Date.now() + duration;
        const endTimestamp = Math.floor(endTime / 1000);

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

        await interaction.reply({
            embeds: [successEmbed(`Giveaway créé dans ${channel} ! 🎉\n\n**Prix :** ${prize}\n**Durée :** ${durationStr}\n**Gagnants :** ${winners}`)],
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
            const winnerList = [];
            const pool = [...participantArray];

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
                embed.setDescription(`**${prize}**\n\n❌ Pas assez de participants pour déterminer un gagnant.`)
                    .setColor('#FF0000');
            } else {
                const winnerMentions = winnerList.map(id => `<@${id}>`).join(', ');
                embed.setDescription(`**${prize}**\n\n🎉 **Gagnant(s) :** ${winnerMentions}\n👤 Organisé par : ${interaction.user}`)
                    .setColor('#00FF00');
                channel.send(`🎉 Félicitations ${winnerMentions} ! Vous avez gagné **${prize}** !`);
            }

            await msg.edit({ embeds: [embed], components: [disabledRow] });
            db.updateGiveaway(entry.id, { ended: 1 });
        });
    },
};
