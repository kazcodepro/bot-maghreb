const fs = require('fs');
const path = require('path');

const categoryMap = {
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

function loadCommands(client) {
    const commandsPath = path.join(__dirname, '..', 'commands');
    const categories = fs.readdirSync(commandsPath).filter(f =>
        fs.statSync(path.join(commandsPath, f)).isDirectory()
    );

    for (const category of categories) {
        const parentName = categoryMap[category] || category;
        const categoryPath = path.join(commandsPath, category);
        const commandFiles = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(path.join(categoryPath, file));
            if (command.data && command.execute) {
                command.category = category;
                const key = `${parentName}:${command.data.name}`;
                client.commands.set(key, command);
            }
        }
    }

    console.log(`[Commands] ${client.commands.size} commandes chargées.`);
}

module.exports = { loadCommands };
