const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vdisconnect')
        .setDescription('Déconnecter un utilisateur du salon vocal')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à déconnecter')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers),
    cooldown: 3,
    async execute(interaction, client) {
        const user = interaction.options.getUser('utilisateur');
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) {
            return interaction.reply({ embeds: [errorEmbed('Cet utilisateur n\'est pas dans le serveur.')], ephemeral: true });
        }

        if (!member.voice.channel) {
            return interaction.reply({ embeds: [errorEmbed('Cet utilisateur n\'est pas dans un salon vocal.')], ephemeral: true });
        }

        try {
            await member.voice.disconnect(`Déconnecté par ${interaction.user.tag}`);
            await interaction.reply({ embeds: [successEmbed(`**${user.tag}** a été déconnecté du vocal.`)] });
        } catch (error) {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue lors de la déconnexion.')], ephemeral: true });
        }
    },
};
