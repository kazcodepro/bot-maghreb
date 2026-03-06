require('dotenv').config();
const { REST, Routes, SlashCommandBuilder, SlashCommandSubcommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const categoryNames = {
    antiraid: 'antiraid',
    channels: 'channel',
    fun: 'fun',
    games: 'game',
    giveaway: 'giveaway',
    information: 'info',
    invites: 'invites',
    moderation: 'mod',
    server: 'server',
    tickets: 'ticket',
    utility: 'util',
    vocal: 'vocal',
    welcome: 'welcome',
};

const categoryDescriptions = {
    antiraid: 'Commandes de protection antiraid',
    channels: 'Gestion des salons et rôles',
    fun: 'Commandes amusantes',
    games: 'Jeux interactifs',
    giveaway: 'Système de giveaways',
    information: 'Commandes d\'information',
    invites: 'Traqueur d\'invitations',
    moderation: 'Commandes de modération',
    server: 'Gestion du serveur',
    tickets: 'Système de tickets',
    utility: 'Utilitaires et outils',
    vocal: 'Modération vocale',
    welcome: 'Système de bienvenue et départ',
};

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const categories = fs.readdirSync(commandsPath).filter(f =>
    fs.statSync(path.join(commandsPath, f)).isDirectory()
);

for (const category of categories) {
    const slashName = categoryNames[category] || category;
    const slashDesc = categoryDescriptions[category] || `Commandes ${category}`;

    const builder = new SlashCommandBuilder()
        .setName(slashName)
        .setDescription(slashDesc);

    const categoryPath = path.join(commandsPath, category);
    const commandFiles = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(path.join(categoryPath, file));
        if (!command.data) continue;
        const cmdJson = command.data.toJSON();

        const sub = new SlashCommandSubcommandBuilder()
            .setName(cmdJson.name)
            .setDescription(cmdJson.description.slice(0, 100));

        if (cmdJson.options) {
            for (const opt of cmdJson.options) {
                if (opt.type === 1 || opt.type === 2) continue; // skip nested subcommands/groups
                const addOption = (sub, opt) => {
                    switch (opt.type) {
                        case 3: // String
                            sub.addStringOption(o => {
                                o.setName(opt.name).setDescription(opt.description.slice(0, 100)).setRequired(!!opt.required);
                                if (opt.choices) o.addChoices(...opt.choices.slice(0, 25));
                                if (opt.min_length) o.setMinLength(opt.min_length);
                                if (opt.max_length) o.setMaxLength(opt.max_length);
                                return o;
                            });
                            break;
                        case 4: // Integer
                            sub.addIntegerOption(o => {
                                o.setName(opt.name).setDescription(opt.description.slice(0, 100)).setRequired(!!opt.required);
                                if (opt.choices) o.addChoices(...opt.choices.slice(0, 25));
                                if (opt.min_value !== undefined) o.setMinValue(opt.min_value);
                                if (opt.max_value !== undefined) o.setMaxValue(opt.max_value);
                                return o;
                            });
                            break;
                        case 5: // Boolean
                            sub.addBooleanOption(o => o.setName(opt.name).setDescription(opt.description.slice(0, 100)).setRequired(!!opt.required));
                            break;
                        case 6: // User
                            sub.addUserOption(o => o.setName(opt.name).setDescription(opt.description.slice(0, 100)).setRequired(!!opt.required));
                            break;
                        case 7: // Channel
                            sub.addChannelOption(o => o.setName(opt.name).setDescription(opt.description.slice(0, 100)).setRequired(!!opt.required));
                            break;
                        case 8: // Role
                            sub.addRoleOption(o => o.setName(opt.name).setDescription(opt.description.slice(0, 100)).setRequired(!!opt.required));
                            break;
                        case 9: // Mentionable
                            sub.addMentionableOption(o => o.setName(opt.name).setDescription(opt.description.slice(0, 100)).setRequired(!!opt.required));
                            break;
                        case 10: // Number
                            sub.addNumberOption(o => {
                                o.setName(opt.name).setDescription(opt.description.slice(0, 100)).setRequired(!!opt.required);
                                if (opt.min_value !== undefined) o.setMinValue(opt.min_value);
                                if (opt.max_value !== undefined) o.setMaxValue(opt.max_value);
                                return o;
                            });
                            break;
                        case 11: // Attachment
                            sub.addAttachmentOption(o => o.setName(opt.name).setDescription(opt.description.slice(0, 100)).setRequired(!!opt.required));
                            break;
                    }
                };
                addOption(sub, opt);
            }
        }

        builder.addSubcommand(sub);
    }

    commands.push(builder.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log(`Déploiement de ${commands.length} commandes groupées (${commands.reduce((a, c) => a + (c.options?.length || 0), 0)} sous-commandes)...`);
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
        console.log('Commandes déployées avec succès !');
    } catch (error) {
        console.error('Erreur:', error.rawError || error.message);
    }
})();
