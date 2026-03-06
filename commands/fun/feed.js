const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const gifs = [
    'https://media.tenor.com/MYhf6YJLBUIAAAAC/anime-feed.gif',
    'https://media.tenor.com/BGIT2CvDAcgAAAAC/anime-food.gif',
    'https://media.tenor.com/J-mOIKsF-UMAAAAC/anime-eat.gif',
];

const foods = ['un cookie 🍪', 'du gâteau 🍰', 'du chocolat 🍫', 'une pizza 🍕', 'des sushis 🍣', 'un croissant 🥐', 'une glace 🍦', 'des crêpes 🥞'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('feed')
        .setDescription('Nourrir quelqu\'un 🍕')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('La personne à nourrir')
                .setRequired(true)),
    cooldown: 3,
    async execute(interaction, client) {
        const user = interaction.options.getUser('utilisateur');
        const gif = gifs[Math.floor(Math.random() * gifs.length)];
        const food = foods[Math.floor(Math.random() * foods.length)];

        const embed = new EmbedBuilder()
            .setColor('#E67E22')
            .setDescription(
                user.id === interaction.user.id
                    ? `**${interaction.user.username}** mange ${food} tout seul... 😋`
                    : `**${interaction.user.username}** a donné ${food} à **${user.username}** 😋`
            )
            .setImage(gif)
            .setFooter({ text: `Demandé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
