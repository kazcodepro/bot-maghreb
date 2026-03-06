const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Affiche la liste des commandes ou les détails d\'une commande')
        .addStringOption(option =>
            option.setName('commande')
                .setDescription('Nom de la commande à détailler')
                .setRequired(false)),
    cooldown: 3,
    async execute(interaction, client) {
        const prefix = '+';
        const commandName = interaction.options.getString('commande');

        if (commandName) {
            const command = client.commands.get(commandName.toLowerCase());
            if (!command) {
                return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.danger).setDescription(`${config.emojis.error} Commande \`${commandName}\` introuvable.`)] });
            }

            const cmdJson = command.data.toJSON();
            const opts = cmdJson.options || [];
            const required = opts.filter(o => o.required).map(o => `<${o.name}>`);
            const optional = opts.filter(o => !o.required).map(o => `[${o.name}]`);
            const usage = `${prefix}${command.data.name}${required.length || optional.length ? ` ${required.join(' ')} ${optional.join(' ')}` : ''}`.trim();

            const embed = new EmbedBuilder()
                .setColor(config.colors.primary)
                .setTitle(`📘 Détail de commande`)
                .setDescription([
                    `### \`${prefix}${command.data.name}\``,
                    command.data.description || 'Aucune description.',
                ].join('\n'))
                .addFields(
                    { name: '⏱️ Cooldown', value: `\`${command.cooldown || 3}s\``, inline: true },
                    { name: '🧩 Catégorie', value: `\`${command.category || 'information'}\``, inline: true },
                    { name: '🛠️ Utilisation', value: `\`${usage}\`` },
                )
                .setFooter({ text: `${client.user.username} • Préfixe : ${prefix}` });

            if (opts.length) {
                const details = opts.map(o => `• \`${o.name}\` — ${o.description}${o.required ? ' *(obligatoire)*' : ''}`).join('\n');
                embed.addFields({ name: 'Paramètres', value: details.slice(0, 1024) });
            }

            return interaction.reply({ embeds: [embed] });
        }

        const categories = {
            'Information': { emoji: 'ℹ️', commands: [] },
            'Modération': { emoji: '🛡️', commands: [] },
            'Vocal': { emoji: '🔊', commands: [] },
            'Utilitaires': { emoji: '🔧', commands: [] },
            'Gestion Serveur': { emoji: '⚙️', commands: [] },
            'Gestion Salons': { emoji: '📁', commands: [] },
            'Antiraid': { emoji: '🛡️', commands: [] },
            'Amusant': { emoji: '🎭', commands: [] },
            'Jeux': { emoji: '🎮', commands: [] },
            'Giveaway': { emoji: '🎉', commands: [] },
            'Invitations': { emoji: '📩', commands: [] },
            'Bienvenue': { emoji: '👋', commands: [] },
            'Tickets': { emoji: '🎫', commands: [] },
        };

        const folderToCategory = {
            'information': 'Information',
            'moderation': 'Modération',
            'vocal': 'Vocal',
            'utility': 'Utilitaires',
            'server': 'Gestion Serveur',
            'channels': 'Gestion Salons',
            'antiraid': 'Antiraid',
            'fun': 'Amusant',
            'games': 'Jeux',
            'giveaway': 'Giveaway',
            'invites': 'Invitations',
            'welcome': 'Bienvenue',
            'tickets': 'Tickets',
        };

        client.commands.forEach(cmd => {
            const folder = cmd.category || 'Information';
            const cat = folderToCategory[folder] || folder;
            if (categories[cat]) {
                categories[cat].commands.push(cmd.data.name);
            }
        });

        const totalCommands = client.commands.size;
        const totalCategories = Object.values(categories).filter(c => c.commands.length > 0).length;

        const mainEmbed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle('🏠 Menu d\'accueil')
            .setDescription([
                `Hey, bienvenue ${interaction.user} sur la page d'accueil **${client.user.username}** !`,
                '',
                '### • Informations',
                `> • Préfixe : \`${prefix}\``,
                `> • Commandes : \`${totalCommands}\``,
                `> • Catégories : \`${totalCategories}\``,
                '',
                '### • Commandes utiles',
                `> • \`${prefix}help\``,
                `> • \`${prefix}help <commande>\``,
                `> • \`${prefix}ping\``,
                '',
                '### • Fonctions à savoir',
                '> • Les paramètres entre `<...>` sont obligatoires.',
                '> • Les paramètres entre `[...]` sont facultatifs.',
                '',
                'Utilisez le menu ci-dessous pour parcourir les catégories du bot !',
            ].join('\n'))
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: `${client.user.username} • Préfixe : ${prefix}` });

        const options = Object.entries(categories)
            .filter(([, data]) => data.commands.length > 0)
            .map(([name, data]) => ({
                label: name,
                value: name,
                emoji: data.emoji,
                description: `${data.commands.length} commande(s)`,
            }));

        if (options.length === 0) {
            options.push({ label: 'Aucune catégorie', value: 'none', description: 'Aucune commande chargée' });
        }

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`help_category:${interaction.user.id}`)
                .setPlaceholder('Sélectionnez une catégorie à parcourir...')
                .addOptions(options),
        );

        await interaction.reply({ embeds: [mainEmbed], components: [row] });
    },
};
