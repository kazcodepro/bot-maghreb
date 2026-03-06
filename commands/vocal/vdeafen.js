const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vdeafen')
        .setDescription('Rendre sourd un utilisateur en vocal')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à rendre sourd en vocal')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('La raison')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.DeafenMembers),
    cooldown: 3,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.MuteMembers)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const user = interaction.options.getUser('utilisateur');
        const reason = interaction.options.getString('raison') || 'Aucune raison';
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) {
            return interaction.reply({ embeds: [errorEmbed('Cet utilisateur n\'est pas dans le serveur.')], ephemeral: true });
        }

        if (!member.voice.channel) {
            return interaction.reply({ embeds: [errorEmbed('Cet utilisateur n\'est pas dans un salon vocal.')], ephemeral: true });
        }

        if (member.voice.serverDeaf) {
            return interaction.reply({ embeds: [errorEmbed('Cet utilisateur est déjà sourd en vocal.')], ephemeral: true });
        }

        try {
            await member.voice.setDeaf(true, `${interaction.user.tag}: ${reason}`);
            await interaction.reply({ embeds: [successEmbed(`**${user.tag}** a été rendu sourd en vocal.\n**Raison :** ${reason}`)] });
        } catch (error) {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue.')], ephemeral: true });
        }
    },
};
