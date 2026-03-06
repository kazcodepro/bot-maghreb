const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vmoveall')
        .setDescription('Déplacer tous les utilisateurs d\'un salon vocal vers un autre')
        .addChannelOption(option =>
            option.setName('salon')
                .setDescription('Le salon vocal de destination')
                .addChannelTypes(ChannelType.GuildVoice, ChannelType.GuildStageVoice)
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers),
    cooldown: 5,
    async execute(interaction, client) {
        const targetChannel = interaction.options.getChannel('salon');

        if (!interaction.member.voice.channel) {
            return interaction.reply({ embeds: [errorEmbed('Vous devez être dans un salon vocal.')], ephemeral: true });
        }

        const sourceChannel = interaction.member.voice.channel;
        const members = sourceChannel.members;

        if (members.size === 0) {
            return interaction.reply({ embeds: [errorEmbed('Il n\'y a personne dans votre salon vocal.')], ephemeral: true });
        }

        if (sourceChannel.id === targetChannel.id) {
            return interaction.reply({ embeds: [errorEmbed('Le salon de destination est le même que le salon actuel.')], ephemeral: true });
        }

        await interaction.deferReply();

        let moved = 0;
        let failed = 0;

        for (const [, member] of members) {
            try {
                await member.voice.setChannel(targetChannel, `Déplacé par ${interaction.user.tag}`);
                moved++;
            } catch {
                failed++;
            }
        }

        await interaction.editReply({ embeds: [successEmbed(`**${moved}** utilisateur(s) déplacé(s) vers ${targetChannel}.\n${failed > 0 ? `**${failed}** échoué(s).` : ''}`)] });
    },
};
