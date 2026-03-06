const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Débannir un utilisateur du serveur')
        .addStringOption(option =>
            option.setName('utilisateur_id')
                .setDescription('L\'ID de l\'utilisateur à débannir')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('La raison du débannissement')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    cooldown: 3,
    async execute(interaction, client) {
        const userId = interaction.options.getString('utilisateur_id');
        const reason = interaction.options.getString('raison') || 'Aucune raison';

        try {
            const ban = await interaction.guild.bans.fetch(userId).catch(() => null);
            if (!ban) {
                return interaction.reply({ embeds: [errorEmbed('Cet utilisateur n\'est pas banni.')], ephemeral: true });
            }

            await interaction.guild.members.unban(userId, `${interaction.user.tag}: ${reason}`);

            db.addSanction(interaction.guild.id, userId, interaction.user.id, 'unban', reason);

            await interaction.reply({ embeds: [successEmbed(`**${ban.user.tag}** a été débanni.\n**Raison :** ${reason}`)] });
        } catch (error) {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue lors du débannissement.')], ephemeral: true });
        }
    },
};
