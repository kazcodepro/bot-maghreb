const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Obtenir le lien d\'invitation du bot et du serveur support'),
    cooldown: 5,
    async execute(interaction, client) {
        const inviteLink = `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`;

        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle(`📩 Inviter ${client.user.username}`)
            .setDescription('Utilisez les boutons ci-dessous pour m\'inviter ou rejoindre le serveur support.')
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: `Demandé par ${interaction.user.tag}` })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Inviter le bot')
                .setStyle(ButtonStyle.Link)
                .setURL(inviteLink)
                .setEmoji('🤖'),
            new ButtonBuilder()
                .setLabel('Serveur support')
                .setStyle(ButtonStyle.Link)
                .setURL('https://discord.gg/support')
                .setEmoji('🏠'),
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};
