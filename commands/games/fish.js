const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { randomInt } = require('../../utils/functions');

const FISH = {
    commun: [
        { name: 'Sardine', emoji: '🐟' },
        { name: 'Maquereau', emoji: '🐟' },
        { name: 'Truite', emoji: '🐟' },
        { name: 'Carpe', emoji: '🐟' },
        { name: 'Perche', emoji: '🐟' },
        { name: 'Gardon', emoji: '🐟' },
        { name: 'Goujon', emoji: '🐟' },
    ],
    rare: [
        { name: 'Saumon', emoji: '🐠' },
        { name: 'Brochet', emoji: '🐠' },
        { name: 'Thon', emoji: '🐠' },
        { name: 'Bar', emoji: '🐠' },
        { name: 'Dorade', emoji: '🐠' },
    ],
    épique: [
        { name: 'Espadon', emoji: '🦈' },
        { name: 'Marlin', emoji: '🦈' },
        { name: 'Mérou géant', emoji: '🦈' },
    ],
    légendaire: [
        { name: 'Requin blanc', emoji: '🦈' },
        { name: 'Poisson-lune', emoji: '🌙' },
        { name: 'Cœlacanthe', emoji: '✨' },
    ]
};

const RARITY_COLORS = {
    commun: '#AAAAAA',
    rare: '#5555FF',
    épique: '#AA00FF',
    légendaire: '#FFD700'
};

const RARITY_CHANCE = [
    { rarity: 'légendaire', threshold: 5 },
    { rarity: 'épique', threshold: 15 },
    { rarity: 'rare', threshold: 40 },
    { rarity: 'commun', threshold: 100 },
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fish')
        .setDescription('Lancez votre canne à pêche et attrapez un poisson !'),
    cooldown: 5,
    async execute(interaction, client) {
        const roll = randomInt(1, 100);
        let rarity = 'commun';
        for (const r of RARITY_CHANCE) {
            if (roll <= r.threshold) {
                rarity = r.rarity;
                break;
            }
        }

        const pool = FISH[rarity];
        const caught = pool[Math.floor(Math.random() * pool.length)];

        const nothingChance = Math.random();
        if (nothingChance < 0.1) {
            const embed = new EmbedBuilder()
                .setTitle('🎣 Pêche')
                .setDescription('🌊 Vous avez lancé votre ligne... mais rien n\'a mordu !')
                .setColor('#888888')
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });
        }

        const embed = new EmbedBuilder()
            .setTitle('🎣 Pêche')
            .setDescription(`Vous avez lancé votre ligne... et attrapé quelque chose !`)
            .addFields(
                { name: 'Prise', value: `${caught.emoji} **${caught.name}**`, inline: true },
                { name: 'Rareté', value: `${rarity.charAt(0).toUpperCase() + rarity.slice(1)}`, inline: true },
                { name: 'Taille', value: `${randomInt(10, 150)} cm`, inline: true }
            )
            .setColor(RARITY_COLORS[rarity])
            .setTimestamp()
            .setFooter({ text: `Pêché par ${interaction.user.username}` });

        await interaction.reply({ embeds: [embed] });
    },
};
