const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const facts = [
    'Les pieuvres ont trois cœurs et du sang bleu.',
    'Le miel ne se périme jamais. Des pots de miel vieux de 3000 ans ont été trouvés en Égypte et étaient encore comestibles.',
    'Les flamants roses naissent blancs et deviennent roses à cause de leur alimentation.',
    'Une journée sur Vénus est plus longue qu\'une année sur Vénus.',
    'Les dauphins dorment avec un œil ouvert.',
    'La Tour Eiffel peut grandir de 15 cm en été à cause de la dilatation thermique.',
    'Les empreintes digitales des koalas sont presque identiques à celles des humains.',
    'Il y a plus d\'étoiles dans l\'univers que de grains de sable sur Terre.',
    'Les chats ne peuvent pas goûter le sucré.',
    'Le cœur d\'une baleine bleue est si gros qu\'un enfant pourrait nager dans ses artères.',
    'Les arbres de la forêt amazonienne produisent environ 20% de l\'oxygène mondial.',
    'Un groupe de flamants roses s\'appelle une "flamboyance".',
    'Les escargots peuvent dormir jusqu\'à 3 ans.',
    'La Grande Muraille de Chine n\'est pas visible depuis l\'espace à l\'œil nu.',
    'Les bananes sont naturellement radioactives.',
    'Un éclair est cinq fois plus chaud que la surface du soleil.',
    'Les humains partagent 60% de leur ADN avec les bananes.',
    'L\'eau chaude gèle plus vite que l\'eau froide, c\'est l\'effet Mpemba.',
    'Les requins existent depuis plus longtemps que les arbres.',
    'Le cerveau humain est composé d\'environ 75% d\'eau.',
    'La Lune s\'éloigne de la Terre d\'environ 3,8 cm par an.',
    'Un nuage pèse en moyenne 500 000 kg.',
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fact')
        .setDescription('Afficher un fait amusant aléatoire'),
    cooldown: 3,
    async execute(interaction, client) {
        const fact = facts[Math.floor(Math.random() * facts.length)];

        const embed = new EmbedBuilder()
            .setColor('#3498DB')
            .setTitle('🧠 Le savais-tu ?')
            .setDescription(fact)
            .setFooter({ text: `Demandé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
