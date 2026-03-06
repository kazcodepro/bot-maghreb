const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nickname')
        .setDescription('Changer le surnom d\'un utilisateur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur dont changer le surnom')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('surnom')
                .setDescription('Le nouveau surnom (vide pour réinitialiser)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),
    cooldown: 3,
    async execute(interaction, client) {
        const user = interaction.options.getUser('utilisateur');
        const nickname = interaction.options.getString('surnom') || null;
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) {
            return interaction.reply({ embeds: [errorEmbed('Cet utilisateur n\'est pas dans le serveur.')], ephemeral: true });
        }

        if (!member.manageable) {
            return interaction.reply({ embeds: [errorEmbed('Je ne peux pas modifier le surnom de cet utilisateur.')], ephemeral: true });
        }

        try {
            const oldNick = member.nickname || member.user.username;
            await member.setNickname(nickname, `Modifié par ${interaction.user.tag}`);

            if (nickname) {
                await interaction.reply({ embeds: [successEmbed(`Le surnom de **${user.tag}** a été changé de **${oldNick}** à **${nickname}**.`)] });
            } else {
                await interaction.reply({ embeds: [successEmbed(`Le surnom de **${user.tag}** a été réinitialisé.`)] });
            }
        } catch (error) {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue lors de la modification du surnom.')], ephemeral: true });
        }
    },
};
