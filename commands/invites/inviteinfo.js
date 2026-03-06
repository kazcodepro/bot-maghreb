const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../utils/functions');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inviteinfo')
        .setDescription('Voir les informations d\'un code d\'invitation')
        .addStringOption(option =>
            option.setName('code')
                .setDescription('Le code d\'invitation')
                .setRequired(true)),
    cooldown: 3,
    async execute(interaction, client) {
        const code = interaction.options.getString('code').replace(/(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\//g, '');

        try {
            const invites = await interaction.guild.invites.fetch();
            const invite = invites.find(i => i.code === code);

            if (!invite) {
                return interaction.reply({ embeds: [errorEmbed('Code d\'invitation introuvable.')], ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setColor(config.colors.primary)
                .setTitle(`${config.emojis.invite} Informations sur l'invitation`)
                .addFields(
                    { name: '🔗 Code', value: invite.code, inline: true },
                    { name: '👤 Créateur', value: invite.inviter ? invite.inviter.tag : 'Inconnu', inline: true },
                    { name: '📊 Utilisations', value: `${invite.uses || 0}`, inline: true },
                    { name: '📊 Max utilisations', value: invite.maxUses ? `${invite.maxUses}` : 'Illimité', inline: true },
                    { name: '📅 Créé le', value: invite.createdAt ? `<t:${Math.floor(invite.createdAt.getTime() / 1000)}:F>` : 'Inconnu', inline: true },
                    { name: '⏰ Expire', value: invite.expiresAt ? `<t:${Math.floor(invite.expiresAt.getTime() / 1000)}:R>` : 'Jamais', inline: true },
                    { name: '📢 Salon', value: invite.channel ? `${invite.channel}` : 'Inconnu', inline: true },
                    { name: '🔒 Temporaire', value: invite.temporary ? 'Oui' : 'Non', inline: true }
                )
                .setFooter({ text: `Demandé par ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Impossible de récupérer les informations de cette invitation.')], ephemeral: true });
        }
    },
};
