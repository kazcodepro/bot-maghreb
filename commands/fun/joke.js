const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const jokes = [
    'Pourquoi les plongeurs plongent-ils toujours en arrière et jamais en avant ? Parce que sinon ils tomberaient dans le bateau.',
    'Qu\'est-ce qu\'un canif ? Un petit fien.',
    'C\'est l\'histoire d\'un schtroumpf qui tombe. Tous les autres schtroumpfs se moquent de lui. Pourquoi ? Parce que c\'est le schtroumpf farceur.',
    'Que dit un escargot quand il croise une limace ? Oh la belle décapotable !',
    'Pourquoi les moutons ne peuvent-ils pas jouer au poker ? Parce qu\'ils montrent toujours leur jeu.',
    'Comment appelle-t-on un chat tombé dans un pot de peinture le jour de Noël ? Un chat peint de Noël.',
    'Quel est le comble pour un électricien ? De ne pas être au courant.',
    'Pourquoi est-ce que le sapin de Noël est nul en couture ? Parce qu\'il perd toujours ses aiguilles.',
    'Deux poissons se rencontrent. Le premier dit : "Salut !" Le deuxième : "Où ?"',
    'Qu\'est-ce qu\'un crocodile qui surveille un terrain ? Un croco-deal.',
    'Pourquoi les fantômes sont-ils de si mauvais menteurs ? Parce qu\'on voit à travers eux.',
    'Comment appelle-t-on un boomerang qui ne revient pas ? Un bâton.',
    'Que fait un geek quand il descend du bus ? Il débloque.',
    'Pourquoi les mathématiciens n\'aiment pas la plage ? Parce qu\'il y a trop de sinus.',
    'Qu\'est-ce qu\'un chou sur un terrain de foot ? Un supporter.',
    'Pourquoi les abeilles ont-elles les cheveux collants ? Parce qu\'elles utilisent un peigne à miel.',
    'Comment appelle-t-on un dinosaure qui fait du bruit en dormant ? Un Ronflosaure.',
    'Que fait un informaticien quand il a froid ? Il ouvre Windows.',
    'Pourquoi les étoiles ne font-elles pas de bruit en tombant ? Parce qu\'elles ont des chutes étoilées.',
    'Quel est le fromage préféré de Dieu ? Le saint-nectaire.',
    'Comment appelle-t-on un chien sans pattes ? On ne l\'appelle pas, on va le chercher.',
    'Pourquoi le livre de maths est-il triste ? Parce qu\'il a trop de problèmes.',
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('joke')
        .setDescription('Raconte une blague aléatoire'),
    cooldown: 3,
    async execute(interaction, client) {
        const joke = jokes[Math.floor(Math.random() * jokes.length)];

        const embed = new EmbedBuilder()
            .setColor('#F1C40F')
            .setTitle('😂 Blague')
            .setDescription(joke)
            .setFooter({ text: `Demandé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
