const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createvoice')
        .setDescription('Créer un salon vocal')
        .addStringOption(option =>
            option.setName('nom')
                .setDescription('Le nom du salon vocal')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('limite')
                .setDescription('Limite d\'utilisateurs (0 = illimité)')
                .setRequired(false)
                .setMinValue(0)
                .setMaxValue(99))
        .addChannelOption(option =>
            option.setName('catégorie')
                .setDescription('La catégorie parente')
                .setRequired(false)
                .addChannelTypes(ChannelType.GuildCategory))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    cooldown: 5,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const nom = interaction.options.getString('nom');
        const limite = interaction.options.getInteger('limite') || 0;
        const category = interaction.options.getChannel('catégorie');

        try {
            const channel = await interaction.guild.channels.create({
                name: nom,
                type: ChannelType.GuildVoice,
                userLimit: limite,
                parent: category?.id || null,
            });

            await interaction.reply({ embeds: [successEmbed(`Le salon vocal ${channel} a été créé.${limite > 0 ? ` Limite : ${limite} utilisateurs.` : ''}`)] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Impossible de créer le salon vocal.')], ephemeral: true });
        }
    },
};
