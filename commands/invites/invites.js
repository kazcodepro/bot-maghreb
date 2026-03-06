const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invites')
        .setDescription('Voir le nombre d\'invitations d\'un utilisateur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur dont vous voulez voir les invitations')
                .setRequired(false)),
    cooldown: 3,
    async execute(interaction, client) {
        const settings = db.getGuildSettings(interaction.guild.id);
        if (!settings.invite_tracking) {
            return interaction.reply({ embeds: [errorEmbed('Le système d\'invitations n\'est pas activé sur ce serveur.')], ephemeral: true });
        }

        const user = interaction.options.getUser('utilisateur') || interaction.user;
        const data = db.getInviteData(interaction.guild.id, user.id);

        const regular = data?.regular || 0;
        const fake = data?.fake || 0;
        const leaves = data?.leaves || 0;
        const total = regular - fake - leaves;

        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
            .setTitle(`${config.emojis.invite} Invitations de ${user.username}`)
            .setDescription(`**${user}** possède **${total}** invitation(s).`)
            .addFields(
                { name: '✅ Régulières', value: `${regular}`, inline: true },
                { name: '❌ Fausses', value: `${fake}`, inline: true },
                { name: '📤 Parties', value: `${leaves}`, inline: true }
            )
            .setFooter({ text: `Demandé par ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
