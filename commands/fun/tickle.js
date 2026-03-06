const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const gifs = [
    'https://media.tenor.com/D8kQ--agX60AAAAC/tickle-anime.gif',
    'https://media.tenor.com/VmPCLJ1sZ-AAAAAC/anime-tickle.gif',
    'https://media.tenor.com/gCNmMO3crikAAAAC/tickle-anime.gif',
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tickle')
        .setDescription('Chatouiller quelqu\'un 🤭')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('La personne à chatouiller')
                .setRequired(true)),
    cooldown: 3,
    async execute(interaction, client) {
        const user = interaction.options.getUser('utilisateur');
        const gif = gifs[Math.floor(Math.random() * gifs.length)];

        const embed = new EmbedBuilder()
            .setColor('#1ABC9C')
            .setDescription(
                user.id === interaction.user.id
                    ? `**${interaction.user.username}** essaie de se chatouiller... ça ne marche pas vraiment 😅`
                    : `**${interaction.user.username}** a chatouillé **${user.username}** 🤭`
            )
            .setImage(gif)
            .setFooter({ text: `Demandé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
