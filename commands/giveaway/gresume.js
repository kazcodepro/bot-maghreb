const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const db = require('../../database/db');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gresume')
        .setDescription('Reprendre un giveaway en pause')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption(option =>
            option.setName('id')
                .setDescription('L\'ID du message du giveaway')
                .setRequired(true)),
    cooldown: 3,
    async execute(interaction, client) {
        const messageId = interaction.options.getString('id');

        const giveaway = db.getGiveawayByMessage(messageId);
        if (!giveaway || giveaway.guild_id !== interaction.guild.id) {
            return interaction.reply({ embeds: [errorEmbed('Giveaway introuvable !')], ephemeral: true });
        }

        if (giveaway.ended) {
            return interaction.reply({ embeds: [errorEmbed('Ce giveaway est déjà terminé !')], ephemeral: true });
        }

        if (!giveaway.paused) {
            return interaction.reply({ embeds: [errorEmbed('Ce giveaway n\'est pas en pause !')], ephemeral: true });
        }

        const channel = interaction.guild.channels.cache.get(giveaway.channel_id);
        if (!channel) return interaction.reply({ embeds: [errorEmbed('Salon introuvable !')], ephemeral: true });

        try {
            const msg = await channel.messages.fetch(messageId);
            const participants = giveaway.participants || [];
            const endTimestamp = Math.floor(giveaway.end_time / 1000);

            const embed = new EmbedBuilder()
                .setTitle('🎉 GIVEAWAY 🎉')
                .setDescription(`**${giveaway.prize}**\n\nCliquez sur le bouton pour participer !\n\n⏰ Fin : <t:${endTimestamp}:R>\n🏆 Gagnant(s) : **${giveaway.winners}**\n🎫 Participants : **${participants.length}**\n👤 Organisé par : <@${giveaway.host_id}>`)
                .setColor('#FF69B4')
                .setTimestamp(new Date(giveaway.end_time))
                .setFooter({ text: `${giveaway.winners} gagnant(s) | Fin` });

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

        db.updateGiveaway(giveaway.id, { paused: 0 });
        await interaction.reply({ embeds: [successEmbed('Giveaway repris ! ▶️')], ephemeral: true });
    },
};
