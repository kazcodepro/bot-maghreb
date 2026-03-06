const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database/db');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gdelete')
        .setDescription('Supprimer un giveaway')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption(option =>
            option.setName('id')
                .setDescription('L\'ID du message du giveaway')
                .setRequired(true)),
    cooldown: 3,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const messageId = interaction.options.getString('id');

        const giveaway = db.getGiveawayByMessage(messageId);
        if (!giveaway || giveaway.guild_id !== interaction.guild.id) {
            return interaction.reply({ embeds: [errorEmbed('Giveaway introuvable !')], ephemeral: true });
        }

        const channel = interaction.guild.channels.cache.get(giveaway.channel_id);
        if (channel) {
            try {
                const msg = await channel.messages.fetch(messageId);
                await msg.delete();
            } catch {
                // Message already deleted
            }
        }

        db.deleteGiveaway(giveaway.id);

        await interaction.reply({ embeds: [successEmbed('Giveaway supprimé avec succès ! 🗑️')], ephemeral: true });
    },
};
