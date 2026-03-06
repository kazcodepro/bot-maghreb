const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const config = require('../../config');
const { successEmbed, errorEmbed, parseDuration, formatDuration } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tempban')
        .setDescription('Bannir temporairement un utilisateur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à bannir temporairement')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('durée')
                .setDescription('Durée du bannissement (ex: 1h, 1d, 1w)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('La raison du bannissement')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    cooldown: 3,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const user = interaction.options.getUser('utilisateur');
        const durationStr = interaction.options.getString('durée');
        const reason = interaction.options.getString('raison') || 'Aucune raison';
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (user.id === interaction.user.id) {
            return interaction.reply({ embeds: [errorEmbed('Vous ne pouvez pas vous bannir vous-même.')], ephemeral: true });
        }

        if (member && !member.bannable) {
            return interaction.reply({ embeds: [errorEmbed('Je ne peux pas bannir cet utilisateur.')], ephemeral: true });
        }

        if (member && member.roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.reply({ embeds: [errorEmbed('Vous ne pouvez pas bannir un utilisateur ayant un rôle supérieur ou égal au vôtre.')], ephemeral: true });
        }

        const duration = parseDuration(durationStr);
        if (!duration) {
            return interaction.reply({ embeds: [errorEmbed('Format de durée invalide. Utilisez : `1m`, `1h`, `1d`, `1w`')], ephemeral: true });
        }

        try {
            await user.send({ embeds: [new EmbedBuilder().setColor(config.colors.danger).setDescription(`${config.emojis.ban} Vous avez été **banni temporairement** de **${interaction.guild.name}**\n**Durée :** ${formatDuration(duration)}\n**Raison :** ${reason}`)] }).catch(() => {});

            await interaction.guild.members.ban(user, { reason: `Tempban par ${interaction.user.tag}: ${reason} (${durationStr})` });

            const expiresAt = Date.now() + duration;
            db.addTempBan(interaction.guild.id, user.id, expiresAt);

            db.addSanction(interaction.guild.id, user.id, interaction.user.id, 'tempban', reason, durationStr);

            await interaction.reply({ embeds: [successEmbed(`**${user.tag}** a été banni temporairement pour **${formatDuration(duration)}**.\n**Raison :** ${reason}`)] });
        } catch (error) {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue lors du bannissement temporaire.')], ephemeral: true });
        }
    },
};
