const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const gifs = [
    'https://media.tenor.com/3lkNpSl3V8IAAAAC/head-pat.gif',
    'https://media.tenor.com/N41zMEVBiDMAAAAC/anime-pat.gif',
    'https://media.tenor.com/EOosFtsl3sIAAAAC/pat-anime.gif',
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pat')
        .setDescription('Tapoter la tête de quelqu\'un 🥰')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('La personne à tapoter')
                .setRequired(true)),
    cooldown: 3,
    async execute(interaction, client) {
        const user = interaction.options.getUser('utilisateur');
        const gif = gifs[Math.floor(Math.random() * gifs.length)];

        const embed = new EmbedBuilder()
            .setColor('#F39C12')
            .setDescription(
                user.id === interaction.user.id
                    ? `**${interaction.user.username}** se tapote la tête 🥰`
                    : `**${interaction.user.username}** a tapoté la tête de **${user.username}** 🥰`
            )
            .setImage(gif)
            .setFooter({ text: `Demandé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
