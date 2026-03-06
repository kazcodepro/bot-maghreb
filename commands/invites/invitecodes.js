const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../utils/functions');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invitecodes')
        .setDescription('Voir les codes d\'invitation d\'un utilisateur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur dont vous voulez voir les codes')
                .setRequired(false)),
    cooldown: 3,
    async execute(interaction, client) {
        const user = interaction.options.getUser('utilisateur') || interaction.user;

        try {
            const invites = await interaction.guild.invites.fetch();
            const userInvites = invites.filter(i => i.inviter?.id === user.id);

            if (!userInvites.size) {
                return interaction.reply({ embeds: [errorEmbed(`${user} n'a aucun code d'invitation.`)], ephemeral: true });
            }

            const codeList = userInvites.map(i =>
                `\`${i.code}\` — **${i.uses || 0}** utilisation(s) — ${i.channel || 'Inconnu'}`
            ).join('\n');

            const embed = new EmbedBuilder()
                .setColor(config.colors.primary)
                .setTitle(`${config.emojis.invite} Codes d'invitation de ${user.username}`)
                .setDescription(codeList.length > 4096 ? codeList.slice(0, 4093) + '...' : codeList)
                .setFooter({ text: `Total : ${userInvites.size} code(s)` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Impossible de récupérer les codes d\'invitation.')], ephemeral: true });
        }
    },
};
