const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pp')
        .setDescription('Mesurer la taille du PP 📏')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à mesurer (par défaut toi-même)')
                .setRequired(false)),
    cooldown: 3,
    async execute(interaction, client) {
        const user = interaction.options.getUser('utilisateur') || interaction.user;

        let hash = 0;
        const idStr = user.id + 'pp';
        for (let i = 0; i < idStr.length; i++) {
            hash = ((hash << 5) - hash) + idStr.charCodeAt(i);
            hash = hash & hash;
        }
        const size = (Math.abs(hash) % 30) + 1;

        const shaft = '='.repeat(size);
        const ascii = `8${shaft}D`;

        const comments = [
            { min: 25, text: 'Impressionnant ! 😳' },
            { min: 20, text: 'Pas mal du tout ! 😏' },
            { min: 15, text: 'Dans la moyenne ! 👍' },
            { min: 10, text: 'Ça pourrait être pire... 😅' },
            { min: 5, text: 'Hmm, c\'est modeste. 🤏' },
            { min: 0, text: 'F dans le chat... 💀' },
        ];

        const comment = comments.find(c => size >= c.min).text;

        const embed = new EmbedBuilder()
            .setColor('#E91E63')
            .setTitle(`📏 Taille du PP de ${user.username}`)
            .setDescription(
                `\`\`\`\n${ascii}\n\`\`\`\n` +
                `**Taille :** ${size} cm\n\n${comment}`
            )
            .setFooter({ text: `Demandé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
