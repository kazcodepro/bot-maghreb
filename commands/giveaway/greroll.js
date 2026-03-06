const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database/db');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('greroll')
        .setDescription('Relancer un giveaway terminé pour choisir de nouveaux gagnants')
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

        if (!giveaway.ended) {
            return interaction.reply({ embeds: [errorEmbed('Ce giveaway n\'est pas encore terminé ! Utilisez `/gend` pour le terminer.')], ephemeral: true });
        }

        const channel = interaction.guild.channels.cache.get(giveaway.channel_id);
        if (!channel) return interaction.reply({ embeds: [errorEmbed('Salon introuvable !')], ephemeral: true });

        const participants = giveaway.participants || [];
        if (participants.length === 0) {
            return interaction.reply({ embeds: [errorEmbed('Il n\'y a aucun participant à ce giveaway !')], ephemeral: true });
        }

        const winnerCount = giveaway.winners;
        const pool = [...participants];
        const winners = [];

        for (let i = 0; i < Math.min(winnerCount, pool.length); i++) {
            const idx = Math.floor(Math.random() * pool.length);
            winners.push(pool.splice(idx, 1)[0]);
        }

        const winnerMentions = winners.map(id => `<@${id}>`).join(', ');

        try {
            const msg = await channel.messages.fetch(messageId);
            const embed = EmbedBuilder.from(msg.embeds[0])
                .setDescription(`**${giveaway.prize}**\n\n🔄 **Nouveau(x) gagnant(s) :** ${winnerMentions}\n👤 Organisé par : <@${giveaway.host_id}>`)
                .setColor('#00FF00');
            await msg.edit({ embeds: [embed] });
        } catch {
            // Message may have been deleted
        }

        await channel.send(`🔄 Nouveau tirage ! Félicitations ${winnerMentions} ! Vous avez gagné **${giveaway.prize}** !`);
        await interaction.reply({ embeds: [successEmbed(`Giveaway relancé ! Nouveau(x) gagnant(s) : ${winnerMentions}`)], ephemeral: true });
    },
};
