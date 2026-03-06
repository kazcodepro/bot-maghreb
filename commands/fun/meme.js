const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('Affiche un mème aléatoire depuis Reddit'),
    cooldown: 3,
    async execute(interaction, client) {
        await interaction.deferReply();

        try {
            const response = await fetch('https://www.reddit.com/r/memes/random/.json');
            const data = await response.json();

            const post = data[0]?.data?.children[0]?.data;

            if (!post || !post.url || post.over_18) {
                const embed = new EmbedBuilder()
                    .setColor('#E74C3C')
                    .setDescription('Impossible de récupérer un mème pour le moment. Réessaie plus tard !');
                return interaction.editReply({ embeds: [embed] });
            }

            const embed = new EmbedBuilder()
                .setColor('#FF4500')
                .setTitle(post.title.length > 256 ? post.title.slice(0, 253) + '...' : post.title)
                .setImage(post.url)
                .setFooter({ text: `👍 ${post.ups} | 💬 ${post.num_comments} | r/${post.subreddit}` })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            const embed = new EmbedBuilder()
                .setColor('#E74C3C')
                .setDescription('Une erreur est survenue lors de la récupération du mème.');
            await interaction.editReply({ embeds: [embed] });
        }
    },
};
