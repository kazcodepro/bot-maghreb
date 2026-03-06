const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('masskick')
        .setDescription('Expulser plusieurs utilisateurs en même temps')
        .addStringOption(option =>
            option.setName('utilisateurs')
                .setDescription('IDs des utilisateurs séparés par des espaces')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 10,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const input = interaction.options.getString('utilisateurs');
        const userIds = input.split(/\s+/).filter(id => /^\d{17,19}$/.test(id));

        if (userIds.length === 0) {
            return interaction.reply({ embeds: [errorEmbed('Aucun ID valide fourni. Séparez les IDs par des espaces.')], ephemeral: true });
        }

        await interaction.deferReply();

        let kicked = 0;
        let failed = 0;

        for (const userId of userIds) {
            try {
                const member = await interaction.guild.members.fetch(userId).catch(() => null);
                if (member && member.kickable) {
                    await member.kick(`Masskick par ${interaction.user.tag}`);
                    db.addSanction(interaction.guild.id, userId, interaction.user.id, 'kick', 'Masskick');
                    kicked++;
                } else {
                    failed++;
                }
            } catch {
                failed++;
            }
        }

        await interaction.editReply({ embeds: [successEmbed(`Masskick terminé.\n**Expulsés :** ${kicked}\n**Échoués :** ${failed}`)] });
    },
};
