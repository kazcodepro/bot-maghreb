const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const config = require('../../config');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('softban')
        .setDescription('Bannir et débannir immédiatement un utilisateur pour purger ses messages')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à softban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('La raison du softban')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    cooldown: 3,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const user = interaction.options.getUser('utilisateur');
        const reason = interaction.options.getString('raison') || 'Aucune raison';
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (user.id === interaction.user.id) {
            return interaction.reply({ embeds: [errorEmbed('Vous ne pouvez pas vous softban vous-même.')], ephemeral: true });
        }

        if (member && !member.bannable) {
            return interaction.reply({ embeds: [errorEmbed('Je ne peux pas bannir cet utilisateur.')], ephemeral: true });
        }

        if (member && member.roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.reply({ embeds: [errorEmbed('Vous ne pouvez pas softban un utilisateur ayant un rôle supérieur ou égal au vôtre.')], ephemeral: true });
        }

        try {
            await user.send({ embeds: [new EmbedBuilder().setColor(config.colors.danger).setDescription(`${config.emojis.ban} Vous avez été **softban** de **${interaction.guild.name}**\n**Raison :** ${reason}`)] }).catch(() => {});

            await interaction.guild.members.ban(user, { deleteMessageDays: 7, reason: `Softban par ${interaction.user.tag}: ${reason}` });
            await interaction.guild.members.unban(user, `Softban par ${interaction.user.tag}`);

            db.addSanction(interaction.guild.id, user.id, interaction.user.id, 'softban', reason);

            await interaction.reply({ embeds: [successEmbed(`**${user.tag}** a été softban (messages purgés).\n**Raison :** ${reason}`)] });
        } catch (error) {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue lors du softban.')], ephemeral: true });
        }
    },
};
