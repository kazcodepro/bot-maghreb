const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');
const config = require('../../config');

const channelTypes = {
    [ChannelType.GuildText]: 'Textuel',
    [ChannelType.GuildVoice]: 'Vocal',
    [ChannelType.GuildCategory]: 'Catégorie',
    [ChannelType.GuildAnnouncement]: 'Annonces',
    [ChannelType.GuildStageVoice]: 'Conférence',
    [ChannelType.GuildForum]: 'Forum',
    [ChannelType.PublicThread]: 'Thread public',
    [ChannelType.PrivateThread]: 'Thread privé',
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('channelinfo')
        .setDescription('Affiche les informations d\'un salon')
        .addChannelOption(option =>
            option.setName('salon')
                .setDescription('Le salon à afficher')
                .setRequired(false)),
    cooldown: 3,
    async execute(interaction, client) {
        const channel = interaction.options.getChannel('salon') || interaction.channel;

        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle(`${config.emojis.info} Informations - #${channel.name}`)
            .addFields(
                { name: '📛 Nom', value: channel.name, inline: true },
                { name: '🆔 ID', value: channel.id, inline: true },
                { name: '📁 Type', value: channelTypes[channel.type] || 'Inconnu', inline: true },
                { name: '📅 Créé le', value: `<t:${Math.floor(channel.createdTimestamp / 1000)}:F>`, inline: true },
            );

        if (channel.topic) embed.addFields({ name: '📝 Sujet', value: channel.topic, inline: false });
        if (channel.parent) embed.addFields({ name: '📁 Catégorie', value: channel.parent.name, inline: true });
        if (channel.nsfw !== undefined) embed.addFields({ name: '🔞 NSFW', value: channel.nsfw ? 'Oui' : 'Non', inline: true });
        if (channel.position !== undefined) embed.addFields({ name: '📊 Position', value: `${channel.position}`, inline: true });
        if (channel.rateLimitPerUser) embed.addFields({ name: '🐌 Slowmode', value: `${channel.rateLimitPerUser}s`, inline: true });
        if (channel.bitrate) embed.addFields({ name: '🔊 Bitrate', value: `${channel.bitrate / 1000}kbps`, inline: true });
        if (channel.userLimit) embed.addFields({ name: '👥 Limite', value: `${channel.userLimit}`, inline: true });

        embed.setFooter({ text: `Demandé par ${interaction.user.tag}` }).setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
