const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const config = require('../../config');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bannir un utilisateur du serveur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à bannir')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('La raison du bannissement')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('supprimer_messages')
                .setDescription('Nombre de jours de messages à supprimer (0-7)')
                .setMinValue(0)
                .setMaxValue(7)
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    cooldown: 3,
    async execute(interaction, client) {
        const user = interaction.options.getUser('utilisateur');
        const reason = interaction.options.getString('raison') || 'Aucune raison';
        const deleteMessages = interaction.options.getInteger('supprimer_messages') || 0;
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (user.id === interaction.user.id) {
            return interaction.reply({ embeds: [errorEmbed('Vous ne pouvez pas vous bannir vous-même.')], ephemeral: true });
        }

        if (user.id === client.user.id) {
            return interaction.reply({ embeds: [errorEmbed('Je ne peux pas me bannir moi-même.')], ephemeral: true });
        }

        if (member) {
            if (!member.bannable) {
                return interaction.reply({ embeds: [errorEmbed('Je ne peux pas bannir cet utilisateur. Vérifiez ma position de rôle.')], ephemeral: true });
            }

            if (member.roles.highest.position >= interaction.member.roles.highest.position) {
                return interaction.reply({ embeds: [errorEmbed('Vous ne pouvez pas bannir un utilisateur ayant un rôle supérieur ou égal au vôtre.')], ephemeral: true });
            }
        }

        try {
            await user.send({ embeds: [new EmbedBuilder().setColor(config.colors.danger).setDescription(`${config.emojis.ban} Vous avez été **banni** de **${interaction.guild.name}**\n**Raison :** ${reason}`)] }).catch(() => {});

            await interaction.guild.members.ban(user, { deleteMessageDays: deleteMessages, reason: `${interaction.user.tag}: ${reason}` });

            db.addSanction(interaction.guild.id, user.id, interaction.user.id, 'ban', reason);

            await interaction.reply({ embeds: [successEmbed(`**${user.tag}** a été banni.\n**Raison :** ${reason}`)] });
        } catch (error) {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue lors du bannissement.')], ephemeral: true });
        }
    },
};
