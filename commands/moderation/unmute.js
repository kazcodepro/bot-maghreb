const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Retirer le mute d\'un utilisateur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à démuter')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('La raison du unmute')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    cooldown: 3,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const user = interaction.options.getUser('utilisateur');
        const reason = interaction.options.getString('raison') || 'Aucune raison';
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) {
            return interaction.reply({ embeds: [errorEmbed('Cet utilisateur n\'est pas dans le serveur.')], ephemeral: true });
        }

        if (!member.isCommunicationDisabled()) {
            return interaction.reply({ embeds: [errorEmbed('Cet utilisateur n\'est pas muet.')], ephemeral: true });
        }

        try {
            await member.timeout(null, `${interaction.user.tag}: ${reason}`);

            db.addSanction(interaction.guild.id, user.id, interaction.user.id, 'unmute', reason);

            await interaction.reply({ embeds: [successEmbed(`**${user.tag}** a été démuté.\n**Raison :** ${reason}`)] });
        } catch (error) {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue lors du unmute.')], ephemeral: true });
        }
    },
};
