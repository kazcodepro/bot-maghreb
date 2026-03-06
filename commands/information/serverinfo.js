const { SlashCommandBuilder, EmbedBuilder, GuildVerificationLevel, GuildExplicitContentFilter } = require('discord.js');
const config = require('../../config');

const verificationLevels = {
    [GuildVerificationLevel.None]: 'Aucun',
    [GuildVerificationLevel.Low]: 'Faible',
    [GuildVerificationLevel.Medium]: 'Moyen',
    [GuildVerificationLevel.High]: 'Élevé',
    [GuildVerificationLevel.VeryHigh]: 'Très élevé',
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Affiche les informations du serveur'),
    cooldown: 5,
    async execute(interaction, client) {
        const guild = interaction.guild;
        const owner = await guild.fetchOwner();

        const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
        const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
        const categories = guild.channels.cache.filter(c => c.type === 4).size;

        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle(`${config.emojis.info} Informations - ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 512 }))
            .addFields(
                { name: '📛 Nom', value: guild.name, inline: true },
                { name: '🆔 ID', value: guild.id, inline: true },
                { name: '👑 Propriétaire', value: `${owner.user.tag}`, inline: true },
                { name: '👥 Membres', value: `${guild.memberCount}`, inline: true },
                { name: '💬 Salons textuels', value: `${textChannels}`, inline: true },
                { name: '🔊 Salons vocaux', value: `${voiceChannels}`, inline: true },
                { name: '📁 Catégories', value: `${categories}`, inline: true },
                { name: '🎭 Rôles', value: `${guild.roles.cache.size}`, inline: true },
                { name: '😀 Emojis', value: `${guild.emojis.cache.size}`, inline: true },
                { name: '🚀 Niveau de boost', value: `Niveau ${guild.premiumTier} (${guild.premiumSubscriptionCount} boosts)`, inline: true },
                { name: '🔒 Vérification', value: verificationLevels[guild.verificationLevel] || 'Inconnu', inline: true },
                { name: '📅 Créé le', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
            )
            .setFooter({ text: `Demandé par ${interaction.user.tag}` })
            .setTimestamp();

        if (guild.bannerURL()) embed.setImage(guild.bannerURL({ size: 1024 }));

        await interaction.reply({ embeds: [embed] });
    },
};
