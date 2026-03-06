const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../config');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Verrouiller un salon')
        .addChannelOption(option =>
            option.setName('salon')
                .setDescription('Le salon à verrouiller')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('La raison du verrouillage')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    cooldown: 3,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const channel = interaction.options.getChannel('salon') || interaction.channel;
        const reason = interaction.options.getString('raison') || 'Aucune raison';

        try {
            await channel.permissionOverwrites.edit(interaction.guild.id, {
                SendMessages: false,
            });

            await interaction.reply({ embeds: [successEmbed(`${config.emojis.lock} Le salon ${channel} a été **verrouillé**.\n**Raison :** ${reason}`)] });
        } catch (error) {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue lors du verrouillage.')], ephemeral: true });
        }
    },
};
