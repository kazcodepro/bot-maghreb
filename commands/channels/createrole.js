const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createrole')
        .setDescription('Créer un rôle')
        .addStringOption(option =>
            option.setName('nom')
                .setDescription('Le nom du rôle')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('couleur')
                .setDescription('La couleur en hexadécimal (ex: #ff0000)')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('hoist')
                .setDescription('Afficher séparément dans la liste des membres')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    cooldown: 5,
    async execute(interaction, client) {
        const nom = interaction.options.getString('nom');
        const couleur = interaction.options.getString('couleur') || '#99AAB5';
        const hoist = interaction.options.getBoolean('hoist') || false;

        const hexRegex = /^#?([0-9a-fA-F]{6})$/;
        const colorValue = couleur.startsWith('#') ? couleur : `#${couleur}`;
        if (!hexRegex.test(colorValue)) {
            return interaction.reply({ embeds: [errorEmbed('Couleur hexadécimale invalide.')], ephemeral: true });
        }

        try {
            const role = await interaction.guild.roles.create({
                name: nom,
                color: colorValue,
                hoist: hoist,
            });

            await interaction.reply({ embeds: [successEmbed(`Le rôle ${role} a été créé avec succès.`)] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Impossible de créer le rôle.')], ephemeral: true });
        }
    },
};
