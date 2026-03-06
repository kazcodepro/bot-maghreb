const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roleicon')
        .setDescription('Définir l\'icône d\'un rôle (nécessite boost niveau 2+)')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Le rôle à modifier')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('url')
                .setDescription('L\'URL de l\'icône')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    cooldown: 5,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const role = interaction.options.getRole('role');
        const url = interaction.options.getString('url');

        if (role.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({ embeds: [errorEmbed('Ce rôle est plus haut ou égal à mon rôle le plus élevé.')], ephemeral: true });
        }

        if (interaction.guild.premiumTier < 2) {
            return interaction.reply({ embeds: [errorEmbed('Le serveur doit avoir le niveau de boost 2 ou supérieur pour les icônes de rôle.')], ephemeral: true });
        }

        try {
            await role.setIcon(url);
            await interaction.reply({ embeds: [successEmbed(`L'icône du rôle **${role.name}** a été mise à jour.`)] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Impossible de définir l\'icône. Vérifiez que l\'URL est valide (PNG, JPG ou emoji).')], ephemeral: true });
        }
    },
};
