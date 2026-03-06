const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed, warningEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deletechannel')
        .setDescription('Supprimer un salon')
        .addChannelOption(option =>
            option.setName('salon')
                .setDescription('Le salon à supprimer')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    cooldown: 5,
    async execute(interaction, client) {
        const channel = interaction.options.getChannel('salon');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('confirm_delete_channel')
                .setLabel('Confirmer')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('cancel_delete_channel')
                .setLabel('Annuler')
                .setStyle(ButtonStyle.Secondary)
        );

        const embed = new EmbedBuilder()
            .setTitle('⚠️ Confirmation')
            .setDescription(`Êtes-vous sûr de vouloir supprimer le salon **${channel.name}** ?`)
            .setColor('#FF0000')
            .setTimestamp();

        const reply = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

        const filter = (i) => i.user.id === interaction.user.id;

        try {
            const confirmation = await reply.awaitMessageComponent({ filter, time: 15000 });

            if (confirmation.customId === 'confirm_delete_channel') {
                await channel.delete();
                await confirmation.update({ embeds: [successEmbed(`Le salon **${channel.name}** a été supprimé.`)], components: [] });
            } else {
                await confirmation.update({ embeds: [warningEmbed('Suppression annulée.')], components: [] });
            }
        } catch {
            await interaction.editReply({ embeds: [warningEmbed('Temps écoulé. Suppression annulée.')], components: [] });
        }
    },
};
