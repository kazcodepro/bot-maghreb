const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rolecolor')
        .setDescription('Changer la couleur d\'un rôle')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Le rôle à modifier')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('couleur')
                .setDescription('La nouvelle couleur en hexadécimal (ex: #ff0000)')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    cooldown: 5,
    async execute(interaction, client) {
        const role = interaction.options.getRole('role');
        const couleur = interaction.options.getString('couleur');

        if (role.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({ embeds: [errorEmbed('Ce rôle est plus haut ou égal à mon rôle le plus élevé.')], ephemeral: true });
        }

        const hexRegex = /^#?([0-9a-fA-F]{6})$/;
        const colorValue = couleur.startsWith('#') ? couleur : `#${couleur}`;
        if (!hexRegex.test(colorValue)) {
            return interaction.reply({ embeds: [errorEmbed('Couleur hexadécimale invalide. Exemple: `#ff0000`')], ephemeral: true });
        }

        try {
            await role.setColor(colorValue);
            await interaction.reply({ embeds: [successEmbed(`La couleur du rôle **${role.name}** a été changée en \`${colorValue}\`.`)] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Impossible de modifier la couleur de ce rôle.')], ephemeral: true });
        }
    },
};
