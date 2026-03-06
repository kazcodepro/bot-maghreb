const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database/db');
const { errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('glist')
        .setDescription('Lister tous les giveaways actifs du serveur')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    cooldown: 5,
    async execute(interaction, client) {
        const giveaways = db.getActiveGiveaways(interaction.guild.id);

        if (!giveaways || giveaways.length === 0) {
            return interaction.reply({ embeds: [errorEmbed('Aucun giveaway actif sur ce serveur !')], ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle('🎉 Giveaways actifs')
            .setColor('#FF69B4')
            .setTimestamp();

        const fields = giveaways.map((g, index) => {
            const participants = g.participants || [];
            const endTimestamp = Math.floor(g.end_time / 1000);
            const status = g.paused ? '⏸️ En pause' : '✅ Actif';
            return {
                name: `${index + 1}. ${g.prize}`,
                value: [
                    `📝 ID : \`${g.message_id}\``,
                    `📍 Salon : <#${g.channel_id}>`,
                    `🏆 Gagnants : ${g.winners}`,
                    `🎫 Participants : ${participants.length}`,
                    `⏰ Fin : <t:${endTimestamp}:R>`,
                    `👤 Hôte : <@${g.host_id}>`,
                    `📊 Statut : ${status}`
                ].join('\n'),
                inline: false
            };
        });

        embed.addFields(fields.slice(0, 25));
        embed.setFooter({ text: `${giveaways.length} giveaway(s) actif(s)` });

        await interaction.reply({ embeds: [embed] });
    },
};
