const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roleall')
        .setDescription('Ajouter un rôle à tous les membres du serveur')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Le rôle à ajouter')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 30,
    async execute(interaction, client) {
        const role = interaction.options.getRole('role');

        if (role.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({ embeds: [errorEmbed('Ce rôle est plus haut ou égal à mon rôle le plus élevé.')], ephemeral: true });
        }

        if (role.managed) {
            return interaction.reply({ embeds: [errorEmbed('Ce rôle est géré par une intégration et ne peut pas être assigné.')], ephemeral: true });
        }

        await interaction.deferReply();

        const members = await interaction.guild.members.fetch();
        let success = 0;
        let failed = 0;

        for (const [, member] of members) {
            if (member.roles.cache.has(role.id)) continue;
            try {
                await member.roles.add(role);
                success++;
            } catch {
                failed++;
            }
        }

        const embed = new EmbedBuilder()
            .setTitle('✅ Rôle ajouté à tous les membres')
            .setDescription(`Le rôle ${role} a été ajouté aux membres.`)
            .addFields(
                { name: 'Réussis', value: `${success}`, inline: true },
                { name: 'Échoués', value: `${failed}`, inline: true }
            )
            .setColor('#00ff00')
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },
};
