const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const gifs = [
    'https://media.tenor.com/OXCV_qL-V60AAAAC/mochi-peachcat.gif',
    'https://media.tenor.com/9e1aE-sBAxkAAAAC/anime-hug.gif',
    'https://media.tenor.com/2mFMwfMqAjgAAAAC/hug-anime.gif',
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hug')
        .setDescription('Faire un câlin à quelqu\'un 🤗')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('La personne à câliner')
                .setRequired(true)),
    cooldown: 3,
    async execute(interaction, client) {
        const user = interaction.options.getUser('utilisateur');

        if (user.id === interaction.user.id) {
            const embed = new EmbedBuilder()
                .setColor('#FFB6C1')
                .setDescription(`**${interaction.user.username}** se fait un câlin à soi-même... 🥺`)
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });
        }

        const gif = gifs[Math.floor(Math.random() * gifs.length)];

        const embed = new EmbedBuilder()
            .setColor('#FFB6C1')
            .setDescription(`**${interaction.user.username}** a fait un câlin à **${user.username}** 🤗`)
            .setImage(gif)
            .setFooter({ text: `Demandé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
