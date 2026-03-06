const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('note')
        .setDescription('Ajouter une note sur un utilisateur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur concerné')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('contenu')
                .setDescription('Le contenu de la note')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    cooldown: 3,
    async execute(interaction, client) {
        const user = interaction.options.getUser('utilisateur');
        const content = interaction.options.getString('contenu');

        db.addNote(interaction.guild.id, user.id, interaction.user.id, content);

        const noteCount = db.getNotes(interaction.guild.id, user.id).length;

        await interaction.reply({ embeds: [successEmbed(`Note ajoutée pour **${user.tag}**.\n**Contenu :** ${content}\n**Total :** ${noteCount} note(s)`)] });
    },
};
