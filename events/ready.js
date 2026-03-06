const { ActivityType } = require('discord.js');

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`✅ ${client.user.tag} est en ligne !`);
        console.log(`📊 ${client.guilds.cache.size} serveurs | ${client.users.cache.size} utilisateurs | ${client.commands.size} commandes`);

        const activities = [
            { name: `/help | ${client.guilds.cache.size} serveurs`, type: ActivityType.Watching },
            { name: `${client.users.cache.size} utilisateurs`, type: ActivityType.Watching },
            { name: `/help pour l'aide`, type: ActivityType.Playing },
        ];

        let i = 0;
        setInterval(() => {
            client.user.setActivity(activities[i % activities.length]);
            i++;
        }, 15000);
    },
};
