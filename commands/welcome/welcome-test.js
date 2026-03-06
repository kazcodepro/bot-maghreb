const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome-test')
        .setDescription('Tester le message de bienvenue')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 5,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const settings = db.getGuildSettings(interaction.guild.id);

        if (!settings.welcome_channel) {
            return interaction.reply({ embeds: [errorEmbed('Aucun salon de bienvenue n\'est configuré. Utilisez `/welcome-channel`.')], ephemeral: true });
        }

        const message = (settings.welcome_message || 'Bienvenue {user} sur **{server}** ! Tu es le {membercount}ème membre !')
            .replace(/{user}/g, interaction.user)
            .replace(/{username}/g, interaction.user.username)
            .replace(/{tag}/g, interaction.user.tag)
            .replace(/{server}/g, interaction.guild.name)
            .replace(/{membercount}/g, interaction.guild.memberCount)
            .replace(/{id}/g, interaction.user.id);

        const embed = new EmbedBuilder()
            .setColor(config.colors.success)
            .setTitle('👋 Bienvenue !')
            .setDescription(message)
            .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        const channel = interaction.guild.channels.cache.get(settings.welcome_channel);
        if (!channel) {
            return interaction.reply({ embeds: [errorEmbed('Le salon de bienvenue configuré est introuvable.')], ephemeral: true });
        }

        try {
            await channel.send({ embeds: [embed] });
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Impossible d\'envoyer le message dans le salon de bienvenue.')], ephemeral: true });
        }
    },
};
