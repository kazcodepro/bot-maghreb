const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed, warningEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unblacklist')
        .setDescription('Retirer un utilisateur de la blacklist')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à retirer de la blacklist')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 3,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const user = interaction.options.getUser('utilisateur');

        try {
            const existing = db.isBlacklisted(interaction.guild.id, user.id);

            if (!existing) {
                const embed = warningEmbed('Non trouvé', `${user} n'est pas dans la blacklist.`);
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            db.removeFromBlacklist(interaction.guild.id, user.id);

            const embed = successEmbed('Blacklist', `${user} a été retiré de la blacklist avec succès.`);
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            const embed = errorEmbed('Erreur', 'Une erreur est survenue lors du retrait de la blacklist.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
