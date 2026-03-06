const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const roasts = [
    'Tu es la preuve que même l\'évolution peut faire marche arrière.',
    'Si la bêtise était un sport, tu serais champion olympique.',
    'T\'es pas bête, t\'es juste un génie incompris... par toi-même.',
    'Ton cerveau est comme un navigateur web : 19 onglets ouverts et aucun ne fonctionne.',
    'Tu es comme un nuage. Quand tu disparais, c\'est une belle journée.',
    'Je t\'expliquerais, mais je n\'ai pas de crayons de couleur.',
    'Si j\'avais un euro pour chaque bonne idée que tu as eue, je serais endetté.',
    'Tu apportes de la joie quand tu quittes la pièce.',
    'Ton QI et la température ambiante se disputent la première place.',
    'T\'es le genre de personne que même Google ne peut pas aider.',
    'Si la patience est une vertu, tu transformes tout le monde en saints.',
    'Tu es comme le lundi : personne ne t\'apprécie vraiment.',
    'Tu as le charisme d\'une porte de garage.',
    'T\'es le genre de personne à rater un escalator.',
    'Tu es la raison pour laquelle les shampoings ont des instructions.',
    'Même ton GPS te dirait de faire demi-tour.',
    'Tu es aussi utile qu\'un parapluie dans un désert.',
    'T\'es comme un Wi-Fi public : pas fiable et plein de bugs.',
    'Ton humour est comme une connexion internet en campagne : ça lag.',
    'Si t\'étais un épice, tu serais de la farine.',
    'Tu es comme un pop-up : personne ne t\'a demandé d\'apparaître.',
    'T\'es le fond d\'écran par défaut des gens.',
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roast')
        .setDescription('Envoyer une vanne à quelqu\'un 🔥')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('La personne à roaster')
                .setRequired(true)),
    cooldown: 3,
    async execute(interaction, client) {
        const user = interaction.options.getUser('utilisateur');
        const roast = roasts[Math.floor(Math.random() * roasts.length)];

        const embed = new EmbedBuilder()
            .setColor('#E74C3C')
            .setTitle('🔥 Roast')
            .setDescription(`${user}, ${roast}`)
            .setFooter({ text: `Demandé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
