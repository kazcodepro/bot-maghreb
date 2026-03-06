const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const db = require('../../database/db');
const { successEmbed, errorEmbed } = require('../../utils/functions');

function parseDuration(str) {
    if (!str) return null;
    const match = str.match(/^(\d+)(s|m|h|d|j)$/i);
    if (!match) return null;
    const val = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000, j: 86400000 };
    return val * (multipliers[unit] || 0);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gedit')
        .setDescription('Modifier un giveaway actif')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption(option =>
            option.setName('id')
                .setDescription('L\'ID du message du giveaway')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('prix')
                .setDescription('Nouveau prix')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('durée')
                .setDescription('Nouvelle durée (ex: 1h, 30m, 1d)'))
        .addIntegerOption(option =>
            option.setName('gagnants')
                .setDescription('Nouveau nombre de gagnants')
                .setMinValue(1)
                .setMaxValue(20)),
    cooldown: 3,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const messageId = interaction.options.getString('id');
        const newPrize = interaction.options.getString('prix');
        const newDurationStr = interaction.options.getString('durée');
        const newWinners = interaction.options.getInteger('gagnants');

        const giveaway = db.getGiveawayByMessage(messageId);
        if (!giveaway || giveaway.guild_id !== interaction.guild.id) {
            return interaction.reply({ embeds: [errorEmbed('Giveaway introuvable !')], ephemeral: true });
        }

        if (giveaway.ended) {
            return interaction.reply({ embeds: [errorEmbed('Ce giveaway est déjà terminé !')], ephemeral: true });
        }

        const prize = newPrize || giveaway.prize;
        const winners = newWinners || giveaway.winners;
        let endTime = giveaway.end_time;

        if (newDurationStr) {
            const duration = parseDuration(newDurationStr);
            if (!duration) {
                return interaction.reply({ embeds: [errorEmbed('Format de durée invalide ! Utilisez : `1s`, `30m`, `1h`, `1d`, `2j`')], ephemeral: true });
            }
            endTime = Date.now() + duration;
        }

        const channel = interaction.guild.channels.cache.get(giveaway.channel_id);
        if (!channel) return interaction.reply({ embeds: [errorEmbed('Salon introuvable !')], ephemeral: true });

        try {
            const msg = await channel.messages.fetch(messageId);
            const participants = giveaway.participants || [];
            const endTimestamp = Math.floor(endTime / 1000);

            const embed = new EmbedBuilder()
                .setTitle('🎉 GIVEAWAY 🎉')
                .setDescription(`**${prize}**\n\nCliquez sur le bouton pour participer !\n\n⏰ Fin : <t:${endTimestamp}:R>\n🏆 Gagnant(s) : **${winners}**\n🎫 Participants : **${participants.length}**\n👤 Organisé par : <@${giveaway.host_id}>`)
                .setColor('#FF69B4')
                .setTimestamp(new Date(endTime))
                .setFooter({ text: `${winners} gagnant(s) | Fin` });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('giveaway_join')
                    .setLabel(`🎉 Participer (${participants.length})`)
                    .setStyle(ButtonStyle.Success)
            );

            await msg.edit({ embeds: [embed], components: [row] });
        } catch {
            // Message may be unavailable
        }

        db.updateGiveaway(giveaway.id, { prize, winners, end_time: endTime });

        const changes = [];
        if (newPrize) changes.push(`**Prix :** ${prize}`);
        if (newDurationStr) changes.push(`**Durée :** ${newDurationStr}`);
        if (newWinners) changes.push(`**Gagnants :** ${winners}`);

        await interaction.reply({
            embeds: [successEmbed(`Giveaway modifié ! ✏️\n\n${changes.join('\n')}`)],
            ephemeral: true
        });
    },
};
