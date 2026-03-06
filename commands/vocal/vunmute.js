const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vunmute')
        .setDescription('Retirer le mute vocal d\'un utilisateur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à démuter en vocal')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers),
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

        if (!member.voice.serverMute) {
            return interaction.reply({ embeds: [errorEmbed('Cet utilisateur n\'est pas muet en vocal.')], ephemeral: true });
        }

        try {
            await member.voice.setMute(false, `Unmute par ${interaction.user.tag}`);
            await interaction.reply({ embeds: [successEmbed(`**${user.tag}** a été démuté en vocal.`)] });
        } catch (error) {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue lors du unmute vocal.')], ephemeral: true });
        }
    },
};
