const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roleposition')
        .setDescription('Changer la position d\'un rôle')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Le rôle à déplacer')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('position')
                .setDescription('La nouvelle position du rôle')
                .setRequired(true)
                .setMinValue(1))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    cooldown: 5,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const role = interaction.options.getRole('role');
        const position = interaction.options.getInteger('position');

        if (role.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({ embeds: [errorEmbed('Ce rôle est plus haut ou égal à mon rôle le plus élevé.')], ephemeral: true });
        }

        if (role.managed) {
            return interaction.reply({ embeds: [errorEmbed('Ce rôle est géré par une intégration.')], ephemeral: true });
        }

        try {
            await role.setPosition(position);
            await interaction.reply({ embeds: [successEmbed(`Le rôle **${role.name}** a été déplacé à la position **${position}**.`)] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Impossible de changer la position de ce rôle. Vérifiez que la position est valide.')], ephemeral: true });
        }
    },
};
