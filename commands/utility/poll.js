const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Créer un sondage avec des réactions')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('La question du sondage')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('option1')
                .setDescription('Première option')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('option2')
                .setDescription('Deuxième option')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('option3')
                .setDescription('Troisième option')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('option4')
                .setDescription('Quatrième option')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('option5')
                .setDescription('Cinquième option')
                .setRequired(false)),
    cooldown: 5,
    async execute(interaction, client) {
        const question = interaction.options.getString('question');
        const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
        const options = [];

        for (let i = 1; i <= 5; i++) {
            const opt = interaction.options.getString(`option${i}`);
            if (opt) options.push(opt);
        }

        const description = options.map((opt, i) => `${emojis[i]} ${opt}`).join('\n\n');

        const embed = new EmbedBuilder()
            .setTitle(`📊 ${question}`)
            .setDescription(description)
            .setColor('#5865F2')
            .setFooter({ text: `Sondage créé par ${interaction.user.tag}` })
            .setTimestamp();

        const msg = await interaction.reply({ embeds: [embed], fetchReply: true });

        for (let i = 0; i < options.length; i++) {
            await msg.react(emojis[i]);
        }
    },
};
