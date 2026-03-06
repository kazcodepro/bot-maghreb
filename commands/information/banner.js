const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banner')
        .setDescription('Affiche la bannière d\'un utilisateur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur dont afficher la bannière')
                .setRequired(false)),
    cooldown: 3,
    async execute(interaction, client) {
        const user = interaction.options.getUser('utilisateur') || interaction.user;
        const fetchedUser = await user.fetch(true);

        if (!fetchedUser.bannerURL()) {
            return interaction.reply({
                embeds: [new EmbedBuilder().setColor(config.colors.danger).setDescription(`${config.emojis.error} **${user.tag}** n'a pas de bannière.`)],
                ephemeral: true,
            });
        }

        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle(`🖼️ Bannière de ${user.tag}`)
            .setImage(fetchedUser.bannerURL({ dynamic: true, size: 4096 }))
            .setFooter({ text: `Demandé par ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
