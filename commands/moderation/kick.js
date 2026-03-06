const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const config = require('../../config');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulser un utilisateur du serveur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à expulser')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('La raison de l\'expulsion')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    cooldown: 3,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const user = interaction.options.getUser('utilisateur');
        const reason = interaction.options.getString('raison') || 'Aucune raison';
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) {
            return interaction.reply({ embeds: [errorEmbed('Cet utilisateur n\'est pas dans le serveur.')], ephemeral: true });
        }

        if (user.id === interaction.user.id) {
            return interaction.reply({ embeds: [errorEmbed('Vous ne pouvez pas vous expulser vous-même.')], ephemeral: true });
        }

        if (!member.kickable) {
            return interaction.reply({ embeds: [errorEmbed('Je ne peux pas expulser cet utilisateur. Vérifiez ma position de rôle.')], ephemeral: true });
        }

        if (member.roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.reply({ embeds: [errorEmbed('Vous ne pouvez pas expulser un utilisateur ayant un rôle supérieur ou égal au vôtre.')], ephemeral: true });
        }

        try {
            await user.send({ embeds: [new EmbedBuilder().setColor(config.colors.danger).setDescription(`${config.emojis.kick} Vous avez été **expulsé** de **${interaction.guild.name}**\n**Raison :** ${reason}`)] }).catch(() => {});

            await member.kick(`${interaction.user.tag}: ${reason}`);

            db.addSanction(interaction.guild.id, user.id, interaction.user.id, 'kick', reason);

            await interaction.reply({ embeds: [successEmbed(`**${user.tag}** a été expulsé.\n**Raison :** ${reason}`)] });
        } catch (error) {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue lors de l\'expulsion.')], ephemeral: true });
        }
    },
};
