const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const quotes = [
    { text: 'La vie, c\'est comme une bicyclette, il faut avancer pour ne pas perdre l\'équilibre.', author: 'Albert Einstein' },
    { text: 'Le succès, c\'est d\'aller d\'échec en échec sans perdre son enthousiasme.', author: 'Winston Churchill' },
    { text: 'La seule façon de faire du bon travail est d\'aimer ce que vous faites.', author: 'Steve Jobs' },
    { text: 'L\'imagination est plus importante que le savoir.', author: 'Albert Einstein' },
    { text: 'Ce n\'est pas parce que les choses sont difficiles que nous n\'osons pas, c\'est parce que nous n\'osons pas qu\'elles sont difficiles.', author: 'Sénèque' },
    { text: 'Le bonheur n\'est pas quelque chose de prêt à l\'emploi. Il découle de vos propres actions.', author: 'Dalaï Lama' },
    { text: 'Soyez le changement que vous voulez voir dans le monde.', author: 'Mahatma Gandhi' },
    { text: 'La folie, c\'est de faire toujours la même chose et de s\'attendre à un résultat différent.', author: 'Albert Einstein' },
    { text: 'Le plus grand risque est de ne prendre aucun risque.', author: 'Mark Zuckerberg' },
    { text: 'Celui qui déplace une montagne commence par déplacer de petites pierres.', author: 'Confucius' },
    { text: 'La connaissance s\'acquiert par l\'expérience, tout le reste n\'est que de l\'information.', author: 'Albert Einstein' },
    { text: 'Il n\'y a qu\'une façon d\'échouer, c\'est d\'abandonner avant d\'avoir réussi.', author: 'Georges Clemenceau' },
    { text: 'Le meilleur moment pour planter un arbre était il y a 20 ans. Le deuxième meilleur moment est maintenant.', author: 'Proverbe chinois' },
    { text: 'Tout ce que vous avez toujours voulu se trouve de l\'autre côté de la peur.', author: 'George Addair' },
    { text: 'La créativité, c\'est l\'intelligence qui s\'amuse.', author: 'Albert Einstein' },
    { text: 'On ne voit bien qu\'avec le cœur. L\'essentiel est invisible pour les yeux.', author: 'Antoine de Saint-Exupéry' },
    { text: 'Le courage n\'est pas l\'absence de peur, mais la capacité de vaincre ce qui fait peur.', author: 'Nelson Mandela' },
    { text: 'Chaque saint a un passé et chaque pécheur a un avenir.', author: 'Oscar Wilde' },
    { text: 'L\'éducation est l\'arme la plus puissante qu\'on puisse utiliser pour changer le monde.', author: 'Nelson Mandela' },
    { text: 'La simplicité est la sophistication suprême.', author: 'Léonard de Vinci' },
    { text: 'Ce qui ne te tue pas te rend plus fort.', author: 'Friedrich Nietzsche' },
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quote')
        .setDescription('Afficher une citation inspirante'),
    cooldown: 3,
    async execute(interaction, client) {
        const quote = quotes[Math.floor(Math.random() * quotes.length)];

        const embed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle('💬 Citation')
            .setDescription(`*"${quote.text}"*\n\n— **${quote.author}**`)
            .setFooter({ text: `Demandé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
