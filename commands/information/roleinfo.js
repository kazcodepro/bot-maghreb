const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roleinfo')
        .setDescription('Affiche les informations d\'un rôle')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Le rôle à afficher')
                .setRequired(true)),
    cooldown: 3,
    async execute(interaction, client) {
        const role = interaction.options.getRole('role');

        const perms = role.permissions.toArray();
        const permsStr = perms.length > 0 ? perms.map(p => `\`${p}\``).join(', ') : 'Aucune';

        const embed = new EmbedBuilder()
            .setColor(role.hexColor || config.colors.primary)
            .setTitle(`🎭 Informations - ${role.name}`)
            .addFields(
                { name: '📛 Nom', value: role.name, inline: true },
                { name: '🆔 ID', value: role.id, inline: true },
                { name: '🎨 Couleur', value: role.hexColor, inline: true },
                { name: '📊 Position', value: `${role.position}`, inline: true },
                { name: '👥 Membres', value: `${role.members.size}`, inline: true },
                { name: '📢 Mentionnable', value: role.mentionable ? 'Oui' : 'Non', inline: true },
                { name: '📌 Affiché séparément', value: role.hoist ? 'Oui' : 'Non', inline: true },
                { name: '🤖 Géré par bot', value: role.managed ? 'Oui' : 'Non', inline: true },
                { name: '📅 Créé le', value: `<t:${Math.floor(role.createdTimestamp / 1000)}:F>`, inline: true },
                { name: '🔐 Permissions', value: permsStr.slice(0, 1024) },
            )
            .setFooter({ text: `Demandé par ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
