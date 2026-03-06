const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('massban')
        .setDescription('Bannir plusieurs utilisateurs en même temps')
        .addStringOption(option =>
            option.setName('utilisateurs')
                .setDescription('IDs des utilisateurs séparés par des espaces')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 10,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const input = interaction.options.getString('utilisateurs');
        const userIds = input.split(/\s+/).filter(id => /^\d{17,19}$/.test(id));

        if (userIds.length === 0) {
            return interaction.reply({ embeds: [errorEmbed('Aucun ID valide fourni. Séparez les IDs par des espaces.')], ephemeral: true });
        }

        await interaction.deferReply();

        let banned = 0;
        let failed = 0;

        for (const userId of userIds) {
            try {
                await interaction.guild.members.ban(userId, { reason: `Massban par ${interaction.user.tag}` });
                db.addSanction(interaction.guild.id, userId, interaction.user.id, 'ban', 'Massban');
                banned++;
            } catch {
                failed++;
            }
        }

        await interaction.editReply({ embeds: [successEmbed(`Massban terminé.\n**Bannis :** ${banned}\n**Échoués :** ${failed}`)] });
    },
};
