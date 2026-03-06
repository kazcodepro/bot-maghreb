const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createcategory')
        .setDescription('Créer une catégorie')
        .addStringOption(option =>
            option.setName('nom')
                .setDescription('Le nom de la catégorie')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    cooldown: 5,
    async execute(interaction, client) {
        const nom = interaction.options.getString('nom');

        try {
            const category = await interaction.guild.channels.create({
                name: nom,
                type: ChannelType.GuildCategory,
            });

            await interaction.reply({ embeds: [successEmbed(`La catégorie **${category.name}** a été créée.`)] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Impossible de créer la catégorie.')], ephemeral: true });
        }
    },
};
