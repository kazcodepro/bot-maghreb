const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { errorEmbed, truncate } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('snipe')
        .setDescription('Voir le dernier message supprimé dans ce salon')
        .addIntegerOption(option =>
            option.setName('index')
                .setDescription('L\'index du message (1 = le plus récent)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(10)),
    cooldown: 3,
    async execute(interaction, client) {
        const index = (interaction.options.getInteger('index') || 1) - 1;
        const snipes = client.snipes?.get(interaction.channel.id);

        if (!snipes || !snipes[index]) {
            return interaction.reply({ embeds: [errorEmbed('Aucun message supprimé trouvé.')] });
        }

        const snipe = snipes[index];

        const embed = new EmbedBuilder()
            .setTitle('🗑️ Message supprimé')
            .setDescription(truncate(snipe.content || '*Pas de contenu texte*', 2000))
            .setAuthor({ name: snipe.author })
            .setColor(0xFF0000)
            .setFooter({ text: `Message #${index + 1}` })
            .setTimestamp(snipe.timestamp);

        if (snipe.attachment) {
            embed.setImage(snipe.attachment);
        }

        await interaction.reply({ embeds: [embed] });
    },
};
