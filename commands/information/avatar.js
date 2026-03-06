const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Affiche l\'avatar d\'un utilisateur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur dont afficher l\'avatar')
                .setRequired(false)),
    cooldown: 3,
    async execute(interaction, client) {
        const user = interaction.options.getUser('utilisateur') || interaction.user;

        const png = user.displayAvatarURL({ extension: 'png', size: 4096 });
        const jpg = user.displayAvatarURL({ extension: 'jpg', size: 4096 });
        const webp = user.displayAvatarURL({ extension: 'webp', size: 4096 });
        const gif = user.displayAvatarURL({ extension: 'gif', size: 4096, forceStatic: false });

        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle(`🖼️ Avatar de ${user.tag}`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 4096 }))
            .setFooter({ text: `Demandé par ${interaction.user.tag}` })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel('PNG').setStyle(ButtonStyle.Link).setURL(png),
            new ButtonBuilder().setLabel('JPG').setStyle(ButtonStyle.Link).setURL(jpg),
            new ButtonBuilder().setLabel('WebP').setStyle(ButtonStyle.Link).setURL(webp),
            new ButtonBuilder().setLabel('GIF').setStyle(ButtonStyle.Link).setURL(gif),
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};
