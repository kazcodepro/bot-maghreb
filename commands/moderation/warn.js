const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const config = require('../../config');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Avertir un utilisateur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à avertir')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('La raison de l\'avertissement')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    cooldown: 3,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const user = interaction.options.getUser('utilisateur');
        const reason = interaction.options.getString('raison') || 'Aucune raison';

        if (user.bot) {
            return interaction.reply({ embeds: [errorEmbed('Vous ne pouvez pas avertir un bot.')], ephemeral: true });
        }

        if (user.id === interaction.user.id) {
            return interaction.reply({ embeds: [errorEmbed('Vous ne pouvez pas vous avertir vous-même.')], ephemeral: true });
        }

        db.addWarning(interaction.guild.id, user.id, interaction.user.id, reason);

        db.addSanction(interaction.guild.id, user.id, interaction.user.id, 'warn', reason);

        const warnCount = db.getWarnings(interaction.guild.id, user.id).length;

        await user.send({ embeds: [new EmbedBuilder().setColor(config.colors.warning).setDescription(`${config.emojis.warning} Vous avez reçu un **avertissement** sur **${interaction.guild.name}**\n**Raison :** ${reason}\n**Total :** ${warnCount} avertissement(s)`)] }).catch(() => {});

        await interaction.reply({ embeds: [successEmbed(`**${user.tag}** a été averti.\n**Raison :** ${reason}\n**Total :** ${warnCount} avertissement(s)`)] });
    },
};
