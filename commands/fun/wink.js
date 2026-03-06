const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const gifs = [
    'https://media.tenor.com/yheo1GBjL7EAAAAC/anime-wink.gif',
    'https://media.tenor.com/VJBHNLNJcTkAAAAC/wink-anime.gif',
    'https://media.tenor.com/4-V35zYKGr8AAAAC/anime-wink.gif',
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wink')
        .setDescription('Faire un clin d\'œil à quelqu\'un 😉')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('La personne à qui faire un clin d\'œil')
                .setRequired(true)),
    cooldown: 3,
    async execute(interaction, client) {
        const user = interaction.options.getUser('utilisateur');
        const gif = gifs[Math.floor(Math.random() * gifs.length)];

        const embed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setDescription(`**${interaction.user.username}** a fait un clin d'œil à **${user.username}** 😉`)
            .setImage(gif)
            .setFooter({ text: `Demandé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
