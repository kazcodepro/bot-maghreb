const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { errorEmbed, truncate } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('firstmessage')
        .setDescription('Voir le premier message envoyé dans ce salon'),
    cooldown: 5,
    async execute(interaction, client) {
        await interaction.deferReply();

        try {
            const messages = await interaction.channel.messages.fetch({ after: '0', limit: 1 });
            const firstMessage = messages.first();

            if (!firstMessage) {
                return interaction.editReply({ embeds: [errorEmbed('Aucun message trouvé dans ce salon.')] });
            }

            const embed = new EmbedBuilder()
                .setTitle('📜 Premier message du salon')
                .setDescription(truncate(firstMessage.content || '*Pas de contenu texte*', 2000))
                .setAuthor({ name: firstMessage.author.tag, iconURL: firstMessage.author.displayAvatarURL() })
                .addFields(
                    { name: 'Envoyé le', value: `<t:${Math.floor(firstMessage.createdTimestamp / 1000)}:F>`, inline: true }
                )
                .setColor('#5865F2')
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('Aller au message')
                    .setURL(firstMessage.url)
                    .setStyle(ButtonStyle.Link)
            );

            await interaction.editReply({ embeds: [embed], components: [row] });
        } catch {
            await interaction.editReply({ embeds: [errorEmbed('Impossible de récupérer le premier message.')] });
        }
    },
};
