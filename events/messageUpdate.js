module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage) {
        if (!oldMessage.guild || oldMessage.author?.bot) return;
        if (oldMessage.content === newMessage.content) return;

        const snipeData = {
            author: oldMessage.author?.tag || 'Inconnu',
            authorId: oldMessage.author?.id,
            oldContent: oldMessage.content || 'Aucun contenu',
            newContent: newMessage.content || 'Aucun contenu',
            timestamp: Date.now(),
        };

        if (!oldMessage.client.editSnipes.has(oldMessage.channel.id)) {
            oldMessage.client.editSnipes.set(oldMessage.channel.id, []);
        }
        const channelSnipes = oldMessage.client.editSnipes.get(oldMessage.channel.id);
        channelSnipes.unshift(snipeData);
        if (channelSnipes.length > 10) channelSnipes.pop();
    },
};
