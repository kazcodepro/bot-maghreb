const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Supprimer un nombre de messages dans le salon')
        .addIntegerOption(option =>
            option.setName('nombre')
                .setDescription('Nombre de messages à supprimer (1-100)')
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(true))
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('Filtrer les messages d\'un utilisateur spécifique')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    cooldown: 5,
    async execute(interaction, client) {
        const amount = interaction.options.getInteger('nombre');
        const user = interaction.options.getUser('utilisateur');

        await interaction.deferReply({ ephemeral: true });

        try {
            let messages = await interaction.channel.messages.fetch({ limit: 100 });

            if (user) {
                messages = messages.filter(m => m.author.id === user.id);
            }

            messages = [...messages.values()].slice(0, amount);

            const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
            const recentMessages = messages.filter(m => m.createdTimestamp > twoWeeksAgo);

            if (recentMessages.length === 0) {
                return interaction.editReply({ embeds: [errorEmbed('Aucun message à supprimer (les messages de plus de 14 jours ne peuvent pas être supprimés en masse).')] });
            }

            const deleted = await interaction.channel.bulkDelete(recentMessages, true);

            await interaction.editReply({ embeds: [successEmbed(`**${deleted.size}** message(s) supprimé(s).${user ? ` (de ${user.tag})` : ''}`)] });
        } catch (error) {
            await interaction.editReply({ embeds: [errorEmbed('Une erreur est survenue lors de la suppression des messages.')] });
        }
    },
};
