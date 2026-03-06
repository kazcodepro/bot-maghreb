const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setautorole')
        .setDescription('Définir le rôle automatique pour les nouveaux membres')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Le rôle à attribuer automatiquement')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 5,
    async execute(interaction, client) {
        const role = interaction.options.getRole('role');

        if (role.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({ embeds: [errorEmbed('Ce rôle est plus haut ou égal à mon rôle le plus élevé.')], ephemeral: true });
        }

        if (role.managed) {
            return interaction.reply({ embeds: [errorEmbed('Ce rôle est géré par une intégration.')], ephemeral: true });
        }

        try {
            await db.updateGuildSetting(interaction.guild.id, 'autorole', role.id);
            await interaction.reply({ embeds: [successEmbed(`Le rôle automatique a été défini sur ${role}.`)] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue lors de la configuration.')], ephemeral: true });
        }
    },
};
