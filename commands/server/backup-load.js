const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');
const { successEmbed, errorEmbed, warningEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('backup-load')
        .setDescription('Charger une sauvegarde du serveur')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('L\'ID de la sauvegarde')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 60,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const backupId = interaction.options.getString('id');

        await interaction.reply({ embeds: [warningEmbed('⚠️ Chargement de la sauvegarde en cours... Cela peut prendre un moment.')], ephemeral: true });

        try {
            const backup = db.getBackup(backupId);
            if (!backup || backup.guild_id !== interaction.guild.id) {
                return interaction.followUp({ embeds: [errorEmbed('Sauvegarde introuvable.')], ephemeral: true });
            }

            const data = typeof backup.data === 'string' ? JSON.parse(backup.data) : backup.data;
            const guild = interaction.guild;

            for (const role of data.roles) {
                try {
                    await guild.roles.create({
                        name: role.name,
                        color: role.color,
                        hoist: role.hoist,
                        permissions: BigInt(role.permissions),
                        mentionable: role.mentionable,
                    });
                } catch {
                    // Skip roles that can't be created
                }
            }

            const categoryMap = new Map();
            const categories = data.channels.filter(c => c.type === ChannelType.GuildCategory);
            for (const cat of categories) {
                try {
                    const created = await guild.channels.create({
                        name: cat.name,
                        type: ChannelType.GuildCategory,
                    });
                    categoryMap.set(cat.name, created.id);
                } catch {
                    // Skip
                }
            }

            const otherChannels = data.channels.filter(c => c.type !== ChannelType.GuildCategory);
            for (const ch of otherChannels) {
                try {
                    await guild.channels.create({
                        name: ch.name,
                        type: ch.type,
                        parent: ch.parent ? categoryMap.get(ch.parent) : null,
                        topic: ch.topic,
                        nsfw: ch.nsfw,
                        rateLimitPerUser: ch.rateLimitPerUser,
                    });
                } catch {
                    // Skip
                }
            }

            const embed = new EmbedBuilder()
                .setTitle('💾 Sauvegarde chargée')
                .setDescription('La sauvegarde a été chargée avec succès. Les rôles et salons ont été recréés.')
                .setColor('#00ff00')
                .setTimestamp();

            await interaction.followUp({ embeds: [embed], ephemeral: true });
        } catch {
            await interaction.followUp({ embeds: [errorEmbed('Une erreur est survenue lors du chargement de la sauvegarde.')], ephemeral: true });
        }
    },
};
