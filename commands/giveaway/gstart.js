const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const db = require('../../database/db');
const { successEmbed, errorEmbed, parseDuration, formatDuration } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gstart')
        .setDescription('Démarrer rapidement un giveaway')
        .addStringOption(o => o.setName('prix').setDescription('Le prix du giveaway').setRequired(true))
        .addStringOption(o => o.setName('duree').setDescription('Durée (ex: 1h, 30m, 1d)').setRequired(true))
        .addIntegerOption(o => o.setName('gagnants').setDescription('Nombre de gagnants').setRequired(false)),
    cooldown: 5,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const prize = interaction.options.getString('prix');
        const durationStr = interaction.options.getString('duree');
        const winners = interaction.options.getInteger('gagnants') || 1;

        if (!prize) return interaction.reply({ embeds: [errorEmbed('Utilisation : `+gstart <prix> <durée> [gagnants]`')] });

        const duration = parseDuration(durationStr);
        if (!duration) return interaction.reply({ embeds: [errorEmbed('Format de durée invalide ! Utilise : `1m`, `1h`, `1d`, `1w`')] });

        const endTime = Date.now() + duration;
        const endTimestamp = Math.floor(endTime / 1000);

        const embed = new EmbedBuilder()
            .setTitle('🎉 GIVEAWAY 🎉')
            .setDescription(`**${prize}**\n\nCliquez sur le bouton pour participer !\n\n⏰ Fin : <t:${endTimestamp}:R>\n🏆 Gagnant(s) : **${winners}**\n🎫 Participants : **0**\n👤 Organisé par : ${interaction.user}`)
            .setColor(0xFF69B4)
            .setTimestamp(new Date(endTime))
            .setFooter({ text: `${winners} gagnant(s) | Fin` });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('giveaway_join').setLabel('🎉 Participer (0)').setStyle(ButtonStyle.Success)
        );

        const msg = await interaction.channel.send({ embeds: [embed], components: [row] });
        db.createGiveaway(interaction.guild.id, interaction.channel.id, msg.id, interaction.user.id, prize, winners, endTime);

        await interaction.reply({ embeds: [successEmbed(`Giveaway créé ! 🎉\n**Prix :** ${prize}\n**Durée :** ${formatDuration(duration)}\n**Gagnants :** ${winners}`)] });
    },
};
