const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const config = require('../../config');
const { errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('Afficher les avertissements d\'un utilisateur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur dont afficher les avertissements')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    cooldown: 3,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const user = interaction.options.getUser('utilisateur');

        const warns = db.getWarnings(interaction.guild.id, user.id);

        if (warns.length === 0) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.primary).setDescription(`${config.emojis.info} **${user.tag}** n'a aucun avertissement.`)] });
        }

        const embed = new EmbedBuilder()
            .setColor(config.colors.warning)
            .setTitle(`${config.emojis.warning} Avertissements de ${user.tag}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setDescription(warns.map(w => `**#${w.id}** - ${w.reason}\n*Par <@${w.moderator_id}> le ${w.created_at}*`).join('\n\n').slice(0, 4096))
            .setFooter({ text: `${warns.length} avertissement(s)` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
