const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setprefix')
        .setDescription('Définir le préfixe du serveur')
        .addStringOption(option =>
            option.setName('prefix')
                .setDescription('Le nouveau préfixe')
                .setRequired(true)
                .setMaxLength(5))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 5,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const prefix = interaction.options.getString('prefix');

        try {
            await db.updateGuildSetting(interaction.guild.id, 'prefix', prefix);
            await interaction.reply({ embeds: [successEmbed(`Le préfixe du serveur a été changé en \`${prefix}\`.`)] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue lors du changement de préfixe.')], ephemeral: true });
        }
    },
};
