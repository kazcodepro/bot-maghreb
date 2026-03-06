const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { randomInt } = require('../../utils/functions');

const ANIMALS = {
    commun: [
        { name: 'Lapin', emoji: '🐇' },
        { name: 'Canard', emoji: '🦆' },
        { name: 'Pigeon', emoji: '🐦' },
        { name: 'Écureuil', emoji: '🐿️' },
        { name: 'Faisan', emoji: '🐦' },
        { name: 'Perdrix', emoji: '🐦' },
    ],
    rare: [
        { name: 'Renard', emoji: '🦊' },
        { name: 'Cerf', emoji: '🦌' },
        { name: 'Sanglier', emoji: '🐗' },
        { name: 'Biche', emoji: '🦌' },
        { name: 'Loup', emoji: '🐺' },
    ],
    épique: [
        { name: 'Ours brun', emoji: '🐻' },
        { name: 'Aigle royal', emoji: '🦅' },
        { name: 'Lynx', emoji: '🐱' },
    ],
    légendaire: [
        { name: 'Dragon', emoji: '🐉' },
        { name: 'Phénix', emoji: '🔥' },
        { name: 'Licorne', emoji: '🦄' },
    ]
};

const RARITY_COLORS = {
    commun: '#AAAAAA',
    rare: '#5555FF',
    épique: '#AA00FF',
    légendaire: '#FFD700'
};

const RARITY_CHANCE = [
    { rarity: 'légendaire', threshold: 3 },
    { rarity: 'épique', threshold: 12 },
    { rarity: 'rare', threshold: 35 },
    { rarity: 'commun', threshold: 100 },
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hunt')
        .setDescription('Partez à la chasse et attrapez un animal !'),
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

        const pool = ANIMALS[rarity];
        const caught = pool[Math.floor(Math.random() * pool.length)];

        const nothingChance = Math.random();
        if (nothingChance < 0.1) {
            const embed = new EmbedBuilder()
                .setTitle('🏹 Chasse')
                .setDescription('🌲 Vous avez exploré la forêt... mais n\'avez rien trouvé !')
                .setColor('#888888')
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });
        }

        const embed = new EmbedBuilder()
            .setTitle('🏹 Chasse')
            .setDescription(`Vous êtes parti en chasse... et avez attrapé quelque chose !`)
            .addFields(
                { name: 'Prise', value: `${caught.emoji} **${caught.name}**`, inline: true },
                { name: 'Rareté', value: `${rarity.charAt(0).toUpperCase() + rarity.slice(1)}`, inline: true },
                { name: 'Poids', value: `${randomInt(1, 200)} kg`, inline: true }
            )
            .setColor(RARITY_COLORS[rarity])
            .setTimestamp()
            .setFooter({ text: `Chassé par ${interaction.user.username}` });

        await interaction.reply({ embeds: [embed] });
    },
};
