const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const config = require('../../config');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nuke')
        .setDescription('Recréer un salon pour supprimer tous les messages')
        .addChannelOption(option =>
            option.setName('salon')
                .setDescription('Le salon à nuke')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 10,
    async execute(interaction, client) {
        const channel = interaction.options.getChannel('salon') || interaction.channel;

        try {
            const newChannel = await channel.clone({
                reason: `Nuke par ${interaction.user.tag}`,
            });

            await newChannel.setPosition(channel.position);
            await channel.delete(`Nuke par ${interaction.user.tag}`);

            const embed = new EmbedBuilder()
                .setColor(config.colors.success)
                .setDescription(`${config.emojis.success} Ce salon a été recréé par **${interaction.user.tag}**.`)
                .setImage('https://media.giphy.com/media/HhTXt43pk1I1W/giphy.gif')
                .setTimestamp();

            await newChannel.send({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ embeds: [errorEmbed('Une erreur est survenue lors du nuke.')], ephemeral: true });
        }
    },
};
