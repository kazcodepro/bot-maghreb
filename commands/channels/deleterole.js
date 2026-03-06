const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deleterole')
        .setDescription('Supprimer un rôle')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Le rôle à supprimer')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    cooldown: 5,
    async execute(interaction, client) {
        const role = interaction.options.getRole('role');

        if (role.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({ embeds: [errorEmbed('Ce rôle est plus haut ou égal à mon rôle le plus élevé.')], ephemeral: true });
        }

        if (role.managed) {
            return interaction.reply({ embeds: [errorEmbed('Ce rôle est géré par une intégration et ne peut pas être supprimé.')], ephemeral: true });
        }

        const roleName = role.name;

        try {
            await role.delete();
            await interaction.reply({ embeds: [successEmbed(`Le rôle **${roleName}** a été supprimé.`)] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Impossible de supprimer ce rôle.')], ephemeral: true });
        }
    },
};
