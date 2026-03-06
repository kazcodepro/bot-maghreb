const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('boosters')
        .setDescription('Afficher tous les boosters du serveur'),
    cooldown: 5,
    async execute(interaction, client) {
        await interaction.deferReply();

        const members = await interaction.guild.members.fetch();
        const boosters = members.filter(m => m.premiumSince);

        if (boosters.size === 0) {
            return interaction.editReply({ embeds: [errorEmbed('Aucun booster trouvé sur ce serveur.')] });
        }

        const list = boosters
            .sort((a, b) => a.premiumSince - b.premiumSince)
            .map((m, i) => {
                const since = Math.floor(m.premiumSince.getTime() / 1000);
                return `**${i + 1}.** ${m.user.tag} — Boost depuis <t:${since}:R>`;
            })
            .join('\n');

        const embed = new EmbedBuilder()
            .setTitle(`💎 Boosters de ${interaction.guild.name}`)
            .setDescription(list)
            .setColor('#f47fff')
            .setFooter({ text: `${boosters.size} booster(s) — Niveau ${interaction.guild.premiumTier}` })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },
};
