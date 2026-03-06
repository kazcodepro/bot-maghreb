const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const db = require('../../database/db');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gpause')
        .setDescription('Mettre en pause un giveaway')
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

        if (giveaway.paused) {
            return interaction.reply({ embeds: [errorEmbed('Ce giveaway est déjà en pause !')], ephemeral: true });
        }

        const channel = interaction.guild.channels.cache.get(giveaway.channel_id);
        if (!channel) return interaction.reply({ embeds: [errorEmbed('Salon introuvable !')], ephemeral: true });

        try {
            const msg = await channel.messages.fetch(messageId);
            const participants = giveaway.participants || [];

            const embed = new EmbedBuilder()
                .setTitle('⏸️ GIVEAWAY EN PAUSE ⏸️')
                .setDescription(`**${giveaway.prize}**\n\n⏸️ Ce giveaway est en pause !\n\n🏆 Gagnant(s) : **${giveaway.winners}**\n🎫 Participants : **${participants.length}**\n👤 Organisé par : <@${giveaway.host_id}>`)
                .setColor('#FFA500')
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('giveaway_join')
                    .setLabel(`⏸️ En pause (${participants.length})`)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true)
            );

            await msg.edit({ embeds: [embed], components: [row] });
        } catch {
            // Message may be unavailable
        }

        db.updateGiveaway(giveaway.id, { paused: 1 });
        await interaction.reply({ embeds: [successEmbed('Giveaway mis en pause ! ⏸️')], ephemeral: true });
    },
};
