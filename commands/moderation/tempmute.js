const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const config = require('../../config');
const { successEmbed, errorEmbed, parseDuration, formatDuration } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tempmute')
        .setDescription('Rendre muet temporairement un utilisateur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à rendre muet')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('durée')
                .setDescription('Durée du mute (ex: 1m, 1h, 1d)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('La raison du mute')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    cooldown: 3,
    async execute(interaction, client) {
        const user = interaction.options.getUser('utilisateur');
        const durationStr = interaction.options.getString('durée');
        const reason = interaction.options.getString('raison') || 'Aucune raison';
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) {
            return interaction.reply({ embeds: [errorEmbed('Cet utilisateur n\'est pas dans le serveur.')], ephemeral: true });
        }

        if (user.id === interaction.user.id) {
            return interaction.reply({ embeds: [errorEmbed('Vous ne pouvez pas vous rendre muet vous-même.')], ephemeral: true });
        }

        if (!member.moderatable) {
            return interaction.reply({ embeds: [errorEmbed('Je ne peux pas rendre muet cet utilisateur.')], ephemeral: true });
        }

        const duration = parseDuration(durationStr);
        if (!duration) {
            return interaction.reply({ embeds: [errorEmbed('Format de durée invalide. Utilisez : `1m`, `1h`, `1d`, `1w`')], ephemeral: true });
        }

        if (duration > 28 * 24 * 60 * 60 * 1000) {
            return interaction.reply({ embeds: [errorEmbed('La durée maximale du timeout est de 28 jours.')], ephemeral: true });
        }

        try {
            await member.timeout(duration, `${interaction.user.tag}: ${reason}`);

            const expiresAt = Date.now() + duration;
            db.addTempMute(interaction.guild.id, user.id, expiresAt);

            db.addSanction(interaction.guild.id, user.id, interaction.user.id, 'tempmute', reason, durationStr);

            await user.send({ embeds: [new EmbedBuilder().setColor(config.colors.danger).setDescription(`${config.emojis.mute} Vous avez été **rendu muet temporairement** sur **${interaction.guild.name}**\n**Durée :** ${formatDuration(duration)}\n**Raison :** ${reason}`)] }).catch(() => {});

            await interaction.reply({ embeds: [successEmbed(`**${user.tag}** a été rendu muet pour **${formatDuration(duration)}**.\n**Raison :** ${reason}`)] });
        } catch (error) {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue lors du mute temporaire.')], ephemeral: true });
        }
    },
};
