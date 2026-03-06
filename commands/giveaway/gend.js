const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const db = require('../../database/db');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gend')
        .setDescription('Terminer un giveaway immédiatement')
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

        const channel = interaction.guild.channels.cache.get(giveaway.channel_id);
        if (!channel) return interaction.reply({ embeds: [errorEmbed('Salon introuvable !')], ephemeral: true });

        let msg;
        try {
            msg = await channel.messages.fetch(messageId);
        } catch {
            return interaction.reply({ embeds: [errorEmbed('Message du giveaway introuvable !')], ephemeral: true });
        }

        const participants = giveaway.participants || [];
        const winnerCount = giveaway.winners;
        const pool = [...participants];
        const winners = [];

        for (let i = 0; i < Math.min(winnerCount, pool.length); i++) {
            const idx = Math.floor(Math.random() * pool.length);
            winners.push(pool.splice(idx, 1)[0]);
        }

        const disabledRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('giveaway_join')
                .setLabel(`🎉 Terminé (${participants.length})`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
        );

        const embed = new EmbedBuilder()
            .setTitle('🎉 GIVEAWAY TERMINÉ 🎉')
            .setTimestamp();

        if (winners.length === 0) {
            embed.setDescription(`**${giveaway.prize}**\n\n❌ Pas assez de participants.`)
                .setColor('#FF0000');
        } else {
            const winnerMentions = winners.map(id => `<@${id}>`).join(', ');
            embed.setDescription(`**${giveaway.prize}**\n\n🎉 **Gagnant(s) :** ${winnerMentions}\n👤 Organisé par : <@${giveaway.host_id}>`)
                .setColor('#00FF00');
            channel.send(`🎉 Félicitations ${winnerMentions} ! Vous avez gagné **${giveaway.prize}** !`);
        }

        await msg.edit({ embeds: [embed], components: [disabledRow] });
        db.updateGiveaway(giveaway.id, { ended: 1 });

        await interaction.reply({ embeds: [successEmbed('Giveaway terminé avec succès ! 🎉')], ephemeral: true });
    },
};
