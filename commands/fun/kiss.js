const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const gifs = [
    'https://media.tenor.com/xBE55ywDtpIAAAAC/anime-kiss.gif',
    'https://media.tenor.com/9e1aE-sBAxkAAAAC/anime-kiss.gif',
    'https://media.tenor.com/YhZGbfCzrEYAAAAC/kiss-anime.gif',
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kiss')
        .setDescription('Embrasser quelqu\'un 💋')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('La personne à embrasser')
                .setRequired(true)),
    cooldown: 3,
    async execute(interaction, client) {
        const user = interaction.options.getUser('utilisateur');

        if (user.id === interaction.user.id) {
            return interaction.reply({ content: 'Tu ne peux pas t\'embrasser toi-même ! 😅', ephemeral: true });
        }

        const gif = gifs[Math.floor(Math.random() * gifs.length)];

        const embed = new EmbedBuilder()
            .setColor('#FF69B4')
            .setDescription(`**${interaction.user.username}** a embrassé **${user.username}** 💋`)
            .setImage(gif)
            .setFooter({ text: `Demandé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
