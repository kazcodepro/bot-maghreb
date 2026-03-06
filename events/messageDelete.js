module.exports = {
    name: 'messageDelete',
    async execute(message) {
        if (!message.guild || message.author?.bot) return;

        const snipeData = {
            author: message.author?.tag || 'Inconnu',
            authorId: message.author?.id,
            content: message.content || 'Aucun contenu',
            attachment: message.attachments.first()?.url || null,
            timestamp: Date.now(),
        };

        if (!message.client.snipes.has(message.channel.id)) {
            message.client.snipes.set(message.channel.id, []);
        }
        const channelSnipes = message.client.snipes.get(message.channel.id);
        channelSnipes.unshift(snipeData);
        if (channelSnipes.length > 10) channelSnipes.pop();
    },
};
