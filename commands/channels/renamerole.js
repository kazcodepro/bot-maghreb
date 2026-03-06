const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('renamerole')
        .setDescription('Renommer un rôle')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Le rôle à renommer')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('nom')
                .setDescription('Le nouveau nom du rôle')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    cooldown: 5,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const role = interaction.options.getRole('role');
        const nom = interaction.options.getString('nom');
        const oldName = role.name;

        if (role.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({ embeds: [errorEmbed('Ce rôle est plus haut ou égal à mon rôle le plus élevé.')], ephemeral: true });
        }

        try {
            await role.setName(nom);
            await interaction.reply({ embeds: [successEmbed(`Le rôle **${oldName}** a été renommé en **${nom}**.`)] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Impossible de renommer ce rôle.')], ephemeral: true });
        }
    },
};
