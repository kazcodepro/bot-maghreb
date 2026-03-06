const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('membercount')
        .setDescription('Affiche le nombre de membres du serveur'),
    cooldown: 5,
    async execute(interaction, client) {
        const guild = interaction.guild;
        await guild.members.fetch();

        const total = guild.memberCount;
        const humans = guild.members.cache.filter(m => !m.user.bot).size;
        const bots = guild.members.cache.filter(m => m.user.bot).size;
        const online = guild.members.cache.filter(m => m.presence?.status === 'online').size;
        const idle = guild.members.cache.filter(m => m.presence?.status === 'idle').size;
        const dnd = guild.members.cache.filter(m => m.presence?.status === 'dnd').size;
        const offline = guild.members.cache.filter(m => !m.presence || m.presence.status === 'offline').size;

        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle(`👥 Membres de ${guild.name}`)
            .addFields(
                { name: '👥 Total', value: `${total}`, inline: true },
                { name: '👤 Humains', value: `${humans}`, inline: true },
                { name: '🤖 Bots', value: `${bots}`, inline: true },
                { name: '🟢 En ligne', value: `${online}`, inline: true },
                { name: '🟡 Inactif', value: `${idle}`, inline: true },
                { name: '🔴 Ne pas déranger', value: `${dnd}`, inline: true },
                { name: '⚫ Hors ligne', value: `${offline}`, inline: true },
            )
            .setFooter({ text: `Demandé par ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
