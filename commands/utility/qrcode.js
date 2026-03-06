const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('qrcode')
        .setDescription('Générer un QR code à partir d\'un texte ou d\'un lien')
        .addStringOption(option =>
            option.setName('texte')
                .setDescription('Le texte ou l\'URL à encoder')
                .setRequired(true)),
    cooldown: 3,
    async execute(interaction, client) {
        const texte = interaction.options.getString('texte');
        const encoded = encodeURIComponent(texte);
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encoded}&size=300x300`;

        const embed = new EmbedBuilder()
            .setTitle('📱 QR Code')
            .setDescription(`QR code généré pour :\n\`${texte}\``)
            .setImage(qrUrl)
            .setColor('#5865F2')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
