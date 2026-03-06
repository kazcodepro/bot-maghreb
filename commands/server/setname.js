const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setname')
        .setDescription('Changer le nom du serveur')
        .addStringOption(option =>
            option.setName('nom')
                .setDescription('Le nouveau nom du serveur')
                .setRequired(true)
                .setMaxLength(100))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    cooldown: 10,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const nom = interaction.options.getString('nom');
        const oldName = interaction.guild.name;

        try {
            await interaction.guild.setName(nom);
            await interaction.reply({ embeds: [successEmbed(`Le nom du serveur a été changé de **${oldName}** à **${nom}**.`)] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Impossible de changer le nom du serveur.')], ephemeral: true });
        }
    },
};
