const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rolehoist')
        .setDescription('Activer/désactiver l\'affichage séparé d\'un rôle')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Le rôle à modifier')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    cooldown: 5,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const role = interaction.options.getRole('role');

        if (role.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({ embeds: [errorEmbed('Ce rôle est plus haut ou égal à mon rôle le plus élevé.')], ephemeral: true });
        }

        try {
            const newHoist = !role.hoist;
            await role.setHoist(newHoist);
            const status = newHoist ? 'activé' : 'désactivé';
            await interaction.reply({ embeds: [successEmbed(`L'affichage séparé du rôle **${role.name}** a été **${status}**.`)] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Impossible de modifier ce rôle.')], ephemeral: true });
        }
    },
};
