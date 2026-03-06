const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const gifs = [
    'https://media.tenor.com/rTzJP5mBGJYAAAAC/cuddle-anime.gif',
    'https://media.tenor.com/OXCV_qL-V60AAAAC/mochi-peachcat.gif',
    'https://media.tenor.com/2mFMwfMqAjgAAAAC/hug-anime.gif',
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cuddle')
        .setDescription('Se blottir contre quelqu\'un 🥰')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('La personne contre qui se blottir')
                .setRequired(true)),
    cooldown: 3,
    async execute(interaction, client) {
        const user = interaction.options.getUser('utilisateur');
        const gif = gifs[Math.floor(Math.random() * gifs.length)];

        const embed = new EmbedBuilder()
            .setColor('#E8A0BF')
            .setDescription(
                user.id === interaction.user.id
                    ? `**${interaction.user.username}** se blottit dans une couverture 🥰`
                    : `**${interaction.user.username}** s'est blotti contre **${user.username}** 🥰`
            )
            .setImage(gif)
            .setFooter({ text: `Demandé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
