const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('emojiinfo')
        .setDescription('Affiche les informations d\'un emoji')
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('L\'emoji à afficher (emoji personnalisé)')
                .setRequired(true)),
    cooldown: 3,
    async execute(interaction, client) {
        const input = interaction.options.getString('emoji');

        const match = input.match(/<?(a)?:?(\w+):(\d+)>?/);
        if (!match) {
            return interaction.reply({
                embeds: [new EmbedBuilder().setColor(config.colors.danger).setDescription(`${config.emojis.error} Veuillez fournir un emoji personnalisé valide.`)],
                ephemeral: true,
            });
        }

        const animated = match[1] === 'a';
        const name = match[2];
        const id = match[3];
        const url = `https://cdn.discordapp.com/emojis/${id}.${animated ? 'gif' : 'png'}?size=256`;

        const guildEmoji = client.emojis.cache.get(id);

        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle(`😀 Informations - ${name}`)
            .setThumbnail(url)
            .addFields(
                { name: '📛 Nom', value: name, inline: true },
                { name: '🆔 ID', value: id, inline: true },
                { name: '✨ Animé', value: animated ? 'Oui' : 'Non', inline: true },
                { name: '🔗 URL', value: `[Lien](${url})`, inline: true },
            );

        if (guildEmoji) {
            embed.addFields(
                { name: '🏠 Serveur', value: guildEmoji.guild.name, inline: true },
                { name: '📅 Créé le', value: `<t:${Math.floor(guildEmoji.createdTimestamp / 1000)}:F>`, inline: true },
            );
        }

        embed.setFooter({ text: `Demandé par ${interaction.user.tag}` }).setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
