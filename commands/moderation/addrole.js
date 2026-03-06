const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addrole')
        .setDescription('Ajouter un rôle à un utilisateur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à qui ajouter le rôle')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Le rôle à ajouter')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    cooldown: 3,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const user = interaction.options.getUser('utilisateur');
        const role = interaction.options.getRole('role');
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) {
            return interaction.reply({ embeds: [errorEmbed('Cet utilisateur n\'est pas dans le serveur.')], ephemeral: true });
        }

        if (role.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({ embeds: [errorEmbed('Ce rôle est supérieur ou égal à mon rôle le plus élevé.')], ephemeral: true });
        }

        if (role.position >= interaction.member.roles.highest.position) {
            return interaction.reply({ embeds: [errorEmbed('Ce rôle est supérieur ou égal à votre rôle le plus élevé.')], ephemeral: true });
        }

        if (member.roles.cache.has(role.id)) {
            return interaction.reply({ embeds: [errorEmbed(`**${user.tag}** a déjà le rôle ${role}.`)], ephemeral: true });
        }

        try {
            await member.roles.add(role, `Ajouté par ${interaction.user.tag}`);
            await interaction.reply({ embeds: [successEmbed(`Le rôle ${role} a été ajouté à **${user.tag}**.`)] });
        } catch (error) {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue lors de l\'ajout du rôle.')], ephemeral: true });
        }
    },
};
