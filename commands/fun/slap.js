const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const gifs = [
    'https://media.tenor.com/Ws6Dm1ZW_uMAAAAC/slap-anime.gif',
    'https://media.tenor.com/mHsIbkFRFhkAAAAC/slap-anime.gif',
    'https://media.tenor.com/j8cUjsVp0CsAAAAC/anime-slap.gif',
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slap')
        .setDescription('Gifler quelqu\'un 👋')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('La personne à gifler')
                .setRequired(true)),
    cooldown: 3,
    async execute(interaction, client) {
        const user = interaction.options.getUser('utilisateur');

        if (user.id === interaction.user.id) {
            return interaction.reply({ content: 'Pourquoi te giflerais-tu toi-même ? 🤔', ephemeral: true });
        }

        const gif = gifs[Math.floor(Math.random() * gifs.length)];

        const embed = new EmbedBuilder()
            .setColor('#E74C3C')
            .setDescription(`**${interaction.user.username}** a giflé **${user.username}** 👋`)
            .setImage(gif)
            .setFooter({ text: `Demandé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
