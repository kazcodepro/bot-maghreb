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
        const commandName = interaction.options.getString('commande');

        if (commandName) {
            const command = client.commands.get(commandName.toLowerCase());
            if (!command) {
                return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.danger).setDescription(`${config.emojis.error} Commande \`${commandName}\` introuvable.`)] });
            }

            const embed = new EmbedBuilder()
                .setColor(config.colors.primary)
                .setTitle(`Commande : +${command.data.name}`)
                .setDescription(command.data.description || 'Aucune description.')
                .addFields({ name: 'Cooldown', value: `${command.cooldown || 3}s`, inline: true });

            const opts = command.data.toJSON().options || [];
            if (opts.length) {
                const usage = opts.map(o => o.required ? `<${o.name}>` : `[${o.name}]`).join(' ');
                embed.addFields({ name: 'Utilisation', value: `\`+${command.data.name} ${usage}\`` });
                const details = opts.map(o => `\`${o.name}\` - ${o.description}`).join('\n');
                embed.addFields({ name: 'Options', value: details });
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

        const mainEmbed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle(`${config.emojis.info} Aide - ${client.user.username}`)
            .setDescription('Sélectionnez une catégorie dans le menu ci-dessous pour voir les commandes disponibles.\n\nPréfixe : `+`')
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: `${client.commands.size} commandes disponibles | Préfixe : +` });

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
                .setCustomId('help_category')
                .setPlaceholder('Choisir une catégorie...')
                .addOptions(options),
        );

        const reply = await interaction.reply({ embeds: [mainEmbed], components: [row] });

        const collector = reply.createMessageComponentCollector({ time: 120000 });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({ content: `${config.emojis.error} Seul ${interaction.user} peut utiliser ce menu.`, ephemeral: true });
            }

            const selected = i.values[0];
            const cat = categories[selected];
            if (!cat) return;

            const catEmbed = new EmbedBuilder()
                .setColor(config.colors.primary)
                .setTitle(`${cat.emoji} ${selected}`)
                .setDescription(cat.commands.map(c => `\`+${c}\``).join(', ') || 'Aucune commande.')
                .setFooter({ text: `${cat.commands.length} commande(s) | Préfixe : +` });

            await i.update({ embeds: [catEmbed], components: [row] });
        });

        collector.on('end', () => {
            reply.edit({ components: [] }).catch(() => {});
        });
    },
};
