const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('permissions')
        .setDescription('Affiche les permissions d\'un utilisateur dans ce serveur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur dont afficher les permissions')
                .setRequired(false)),
    cooldown: 3,
    async execute(interaction, client) {
        const user = interaction.options.getUser('utilisateur') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) {
            return interaction.reply({
                embeds: [new EmbedBuilder().setColor(config.colors.danger).setDescription(`${config.emojis.error} Utilisateur introuvable dans ce serveur.`)],
                ephemeral: true,
            });
        }

        const perms = member.permissions.toArray();
        const permsList = perms.map(p => `✅ \`${p}\``).join('\n') || 'Aucune permission';

        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle(`🔐 Permissions de ${user.tag}`)
            .setDescription(permsList.slice(0, 4096))
            .setFooter({ text: `${perms.length} permission(s) • Demandé par ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
