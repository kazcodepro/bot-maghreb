const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vundeafen')
        .setDescription('Retirer la sourdine vocale d\'un utilisateur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à qui retirer la sourdine')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.DeafenMembers),
    cooldown: 3,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.MuteMembers)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const user = interaction.options.getUser('utilisateur');
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) {
            return interaction.reply({ embeds: [errorEmbed('Cet utilisateur n\'est pas dans le serveur.')], ephemeral: true });
        }

        if (!member.voice.channel) {
            return interaction.reply({ embeds: [errorEmbed('Cet utilisateur n\'est pas dans un salon vocal.')], ephemeral: true });
        }

        if (!member.voice.serverDeaf) {
            return interaction.reply({ embeds: [errorEmbed('Cet utilisateur n\'est pas en sourdine vocale.')], ephemeral: true });
        }

        try {
            await member.voice.setDeaf(false, `Undeaf par ${interaction.user.tag}`);
            await interaction.reply({ embeds: [successEmbed(`La sourdine vocale de **${user.tag}** a été retirée.`)] });
        } catch (error) {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue.')], ephemeral: true });
        }
    },
};
