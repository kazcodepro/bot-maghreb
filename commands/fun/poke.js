const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const gifs = [
    'https://media.tenor.com/N9dMEhSMPQwAAAAC/poke-anime.gif',
    'https://media.tenor.com/nxS1aqEHTLcAAAAC/anime-poke.gif',
    'https://media.tenor.com/5cU-AqAPR2sAAAAC/poke-anime.gif',
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poke')
        .setDescription('Piquer quelqu\'un du doigt 👉')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('La personne à piquer')
                .setRequired(true)),
    cooldown: 3,
    async execute(interaction, client) {
        const user = interaction.options.getUser('utilisateur');
        const gif = gifs[Math.floor(Math.random() * gifs.length)];

        const embed = new EmbedBuilder()
            .setColor('#3498DB')
            .setDescription(
                user.id === interaction.user.id
                    ? `**${interaction.user.username}** s'est piqué soi-même... pourquoi ? 🤔`
                    : `**${interaction.user.username}** a piqué **${user.username}** 👉`
            )
            .setImage(gif)
            .setFooter({ text: `Demandé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
