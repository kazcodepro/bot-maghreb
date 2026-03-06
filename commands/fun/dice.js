const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dice')
        .setDescription('Lancer un dé')
        .addIntegerOption(option =>
            option.setName('faces')
                .setDescription('Nombre de faces du dé (par défaut 6)')
                .setMinValue(2)
                .setMaxValue(100)
                .setRequired(false)),
    cooldown: 3,
    async execute(interaction, client) {
        const faces = interaction.options.getInteger('faces') || 6;
        const result = Math.floor(Math.random() * faces) + 1;

        const diceEmojis = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        const emoji = faces === 6 && result <= 6 ? diceEmojis[result] : '🎲';

        const embed = new EmbedBuilder()
            .setColor('#E67E22')
            .setTitle('🎲 Lancer de dé')
            .setDescription(`Tu as lancé un dé à **${faces}** faces.\n\n${emoji} Résultat : **${result}**`)
            .setFooter({ text: `Lancé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
