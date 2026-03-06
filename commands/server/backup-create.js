const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed, randomInt } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('backup-create')
        .setDescription('Créer une sauvegarde du serveur')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 30,
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const guild = interaction.guild;

            const roles = guild.roles.cache
                .filter(r => r.id !== guild.id)
                .sort((a, b) => b.position - a.position)
                .map(r => ({
                    name: r.name,
                    color: r.hexColor,
                    hoist: r.hoist,
                    permissions: r.permissions.bitfield.toString(),
                    mentionable: r.mentionable,
                    position: r.position,
                }));

            const channels = guild.channels.cache.map(c => ({
                name: c.name,
                type: c.type,
                position: c.position,
                parent: c.parent?.name || null,
                topic: c.topic || null,
                nsfw: c.nsfw || false,
                rateLimitPerUser: c.rateLimitPerUser || 0,
            }));

            const backupData = {
                name: guild.name,
                icon: guild.iconURL(),
                roles,
                channels,
                createdAt: Date.now(),
            };

            const backupId = `${randomInt(1000, 9999)}-${randomInt(1000, 9999)}`;

            try {
                db.createBackup(backupId, guild.id, interaction.user.id, backupData);
            } catch (err) {
                console.error('Erreur backup:', err);
            }

            const embed = new EmbedBuilder()
                .setTitle('💾 Sauvegarde créée')
                .setDescription(`La sauvegarde du serveur a été créée avec succès.`)
                .addFields(
                    { name: 'ID', value: `\`${backupId}\``, inline: true },
                    { name: 'Rôles', value: `${roles.length}`, inline: true },
                    { name: 'Salons', value: `${channels.length}`, inline: true }
                )
                .setColor('#00ff00')
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch {
            await interaction.editReply({ embeds: [errorEmbed('Une erreur est survenue lors de la création de la sauvegarde.')] });
        }
    },
};
