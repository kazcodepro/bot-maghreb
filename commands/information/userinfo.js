const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config');

const badgeEmojis = {
    ActiveDeveloper: '<:activedeveloper:1>',
    BugHunterLevel1: '🐛',
    BugHunterLevel2: '🐛',
    CertifiedModerator: '👮',
    HypeSquadOnlineHouse1: '🏠',
    HypeSquadOnlineHouse2: '🏠',
    HypeSquadOnlineHouse3: '🏠',
    Hypesquad: '🎉',
    Partner: '👥',
    PremiumEarlySupporter: '👑',
    Staff: '⚙️',
    VerifiedBot: '✅',
    VerifiedDeveloper: '🔧',
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Affiche les informations d\'un utilisateur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à afficher')
                .setRequired(false)),
    cooldown: 3,
    async execute(interaction, client) {
        const user = interaction.options.getUser('utilisateur') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        const fetchedUser = await user.fetch(true);

        const badges = fetchedUser.flags?.toArray() || [];
        const badgeStr = badges.map(b => badgeEmojis[b] || b).join(' ') || 'Aucun';

        const embed = new EmbedBuilder()
            .setColor(member?.displayHexColor || config.colors.primary)
            .setTitle(`${config.emojis.info} Informations - ${user.tag}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
            .addFields(
                { name: '📛 Nom d\'utilisateur', value: user.tag, inline: true },
                { name: '🆔 ID', value: user.id, inline: true },
                { name: '🤖 Bot', value: user.bot ? 'Oui' : 'Non', inline: true },
                { name: '📅 Compte créé le', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: true },
            );

        if (member) {
            embed.addFields(
                { name: '📥 A rejoint le', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: true },
                { name: '🎨 Surnom', value: member.nickname || 'Aucun', inline: true },
                { name: `🎭 Rôles (${member.roles.cache.size - 1})`, value: member.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => r.toString()).join(', ').slice(0, 1024) || 'Aucun' },
            );

            if (member.premiumSinceTimestamp) {
                embed.addFields({ name: '🚀 Boost depuis', value: `<t:${Math.floor(member.premiumSinceTimestamp / 1000)}:F>`, inline: true });
            }
        }

        embed.addFields({ name: '🏅 Badges', value: badgeStr });

        if (fetchedUser.bannerURL()) {
            embed.setImage(fetchedUser.bannerURL({ dynamic: true, size: 512 }));
        }

        await interaction.reply({ embeds: [embed] });
    },
};
