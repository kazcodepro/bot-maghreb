const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const compliments = [
    'Tu es une personne incroyable et tout le monde le sait !',
    'Le monde est meilleur avec toi dedans.',
    'Tu as un sourire qui illumine toute la pièce.',
    'Tu es plus fort(e) que tu ne le penses.',
    'Ta gentillesse est contagieuse.',
    'Tu es un rayon de soleil dans la vie des gens.',
    'Tu as un talent naturel pour rendre les gens heureux.',
    'Tu es la définition même de l\'excellence.',
    'Tout ce que tu touches devient de l\'or.',
    'Tu es une source d\'inspiration pour tous ceux qui te connaissent.',
    'Le monde a besoin de plus de gens comme toi.',
    'Tu as un cœur en or.',
    'Tu es plus brillant(e) que les étoiles.',
    'Ta présence rend chaque moment spécial.',
    'Tu as une énergie positive qui se ressent immédiatement.',
    'Tu es unique et c\'est ta plus grande force.',
    'Chaque jour, tu deviens une meilleure version de toi-même.',
    'Tu es la preuve que la perfection existe.',
    'Ton rire est la meilleure mélodie.',
    'Tu mérites tout le bonheur du monde.',
    'Tu es la personne que tout le monde aimerait connaître.',
    'Ta créativité est sans limites.',
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('compliment')
        .setDescription('Faire un compliment à quelqu\'un 💝')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('La personne à complimenter')
                .setRequired(true)),
    cooldown: 3,
    async execute(interaction, client) {
        const user = interaction.options.getUser('utilisateur');
        const compliment = compliments[Math.floor(Math.random() * compliments.length)];

        const embed = new EmbedBuilder()
            .setColor('#2ECC71')
            .setTitle('💝 Compliment')
            .setDescription(`${user}, ${compliment}`)
            .setFooter({ text: `De la part de ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
