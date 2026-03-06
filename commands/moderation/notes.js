const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const config = require('../../config');
const { errorEmbed, truncate } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('notes')
        .setDescription('Afficher les notes d\'un utilisateur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur dont afficher les notes')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    cooldown: 3,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const user = interaction.options.getUser('utilisateur');

        const notes = db.getNotes(interaction.guild.id, user.id);

        if (notes.length === 0) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.primary).setDescription(`${config.emojis.info} **${user.tag}** n'a aucune note.`)] });
        }

        const description = notes.map(n => `**#${n.id}** - ${n.content}\n*Par <@${n.moderator_id}> le ${n.created_at}*`).join('\n\n');

        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle(`📝 Notes de ${user.tag}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setDescription(truncate(description, 4096))
            .setFooter({ text: `${notes.length} note(s)` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
