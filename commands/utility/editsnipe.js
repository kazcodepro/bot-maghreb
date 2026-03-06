const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { errorEmbed, truncate } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('editsnipe')
        .setDescription('Voir le dernier message modifié dans ce salon')
        .addIntegerOption(option =>
            option.setName('index')
                .setDescription('L\'index du message (1 = le plus récent)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(10)),
    cooldown: 3,
    async execute(interaction, client) {
        const index = (interaction.options.getInteger('index') || 1) - 1;
        const editSnipes = client.editSnipes?.get(interaction.channel.id);

        if (!editSnipes || !editSnipes[index]) {
            return interaction.reply({ embeds: [errorEmbed('Aucun message modifié trouvé.')] });
        }

        const snipe = editSnipes[index];

        const embed = new EmbedBuilder()
            .setTitle('✏️ Message modifié')
            .addFields(
                { name: 'Avant', value: truncate(snipe.oldContent || '*Vide*', 1024) },
                { name: 'Après', value: truncate(snipe.newContent || '*Vide*', 1024) }
            )
            .setAuthor({ name: snipe.author })
            .setColor(0xFFA500)
            .setFooter({ text: `Message #${index + 1}` })
            .setTimestamp(snipe.timestamp);

        await interaction.reply({ embeds: [embed] });
    },
};
