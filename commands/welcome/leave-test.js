const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave-test')
        .setDescription('Tester le message de départ')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 5,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const settings = db.getGuildSettings(interaction.guild.id);

        if (!settings.leave_channel) {
            return interaction.reply({ embeds: [errorEmbed('Aucun salon de départ n\'est configuré. Utilisez `/leave-channel`.')], ephemeral: true });
        }

        const message = (settings.leave_message || '{user} a quitté **{server}**. Nous sommes maintenant {membercount} membres.')
            .replace(/{user}/g, interaction.user)
            .replace(/{username}/g, interaction.user.username)
            .replace(/{tag}/g, interaction.user.tag)
            .replace(/{server}/g, interaction.guild.name)
            .replace(/{membercount}/g, interaction.guild.memberCount)
            .replace(/{id}/g, interaction.user.id);

        const embed = new EmbedBuilder()
            .setColor(config.colors.danger)
            .setTitle('👋 Départ')
            .setDescription(message)
            .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        const channel = interaction.guild.channels.cache.get(settings.leave_channel);
        if (!channel) {
            return interaction.reply({ embeds: [errorEmbed('Le salon de départ configuré est introuvable.')], ephemeral: true });
        }

        try {
            await channel.send({ embeds: [embed] });
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Impossible d\'envoyer le message dans le salon de départ.')], ephemeral: true });
        }
    },
};
