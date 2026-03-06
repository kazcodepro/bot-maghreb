const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createchannel')
        .setDescription('Créer un salon textuel ou vocal')
        .addStringOption(option =>
            option.setName('nom')
                .setDescription('Le nom du salon')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Le type de salon')
                .setRequired(false)
                .addChoices(
                    { name: 'Textuel', value: 'text' },
                    { name: 'Vocal', value: 'voice' }
                ))
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
        const type = interaction.options.getString('type') || 'text';
        const category = interaction.options.getChannel('catégorie');

        const channelType = type === 'voice' ? ChannelType.GuildVoice : ChannelType.GuildText;

        try {
            const channel = await interaction.guild.channels.create({
                name: nom,
                type: channelType,
                parent: category?.id || null,
            });

            await interaction.reply({ embeds: [successEmbed(`Le salon ${channel} a été créé avec succès.`)] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Impossible de créer le salon.')], ephemeral: true });
        }
    },
};
