const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const config = require('../../config');
const { errorEmbed, truncate } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sanctions')
        .setDescription('Afficher toutes les sanctions d\'un utilisateur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur dont afficher les sanctions')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    cooldown: 3,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const user = interaction.options.getUser('utilisateur');

        const sanctions = db.getSanctions(interaction.guild.id, user.id);

        if (sanctions.length === 0) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.primary).setDescription(`${config.emojis.info} **${user.tag}** n'a aucune sanction.`)] });
        }

        const typeEmojis = { ban: config.emojis.ban, unban: '🔓', kick: config.emojis.kick, mute: config.emojis.mute, unmute: '🔊', warn: '⚠️', softban: '🔨', tempban: '⏳', tempmute: '⏳' };

        const description = sanctions.map(s => {
            const emoji = typeEmojis[s.type] || '📋';
            const duration = s.duration ? ` (${s.duration})` : '';
            return `${emoji} **${s.type.toUpperCase()}**${duration} - ${s.reason}\n*Par <@${s.moderator_id}> le ${s.created_at}* (ID: ${s.id})`;
        }).join('\n\n');

        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle(`📋 Sanctions de ${user.tag}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setDescription(truncate(description, 4096))
            .setFooter({ text: `${sanctions.length} sanction(s)` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
