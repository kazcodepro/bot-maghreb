const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { successEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Se mettre en AFK')
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('La raison de votre absence')
                .setRequired(false)),
    cooldown: 5,
    async execute(interaction, client) {
        const raison = interaction.options.getString('raison') || 'Aucune raison spécifiée';

        try {
            db.setAfk(interaction.guild.id, interaction.user.id, raison);
        } catch (err) {
            console.error('Erreur AFK:', err);
        }

        const embed = new EmbedBuilder()
            .setTitle('💤 AFK')
            .setDescription(`${interaction.user} est maintenant AFK.`)
            .addFields({ name: 'Raison', value: raison })
            .setColor('#FFA500')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
