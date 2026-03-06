const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stealemoji')
        .setDescription('Voler un emoji d\'un autre serveur et l\'ajouter au vôtre')
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('L\'emoji à voler')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('nom')
                .setDescription('Le nom de l\'emoji (optionnel)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions),
    cooldown: 5,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const emojiStr = interaction.options.getString('emoji');
        const customName = interaction.options.getString('nom');

        const emojiRegex = /<?(a)?:?(\w+):(\d+)>?/;
        const match = emojiStr.match(emojiRegex);

        if (!match) {
            return interaction.reply({ embeds: [errorEmbed('Emoji invalide. Utilisez un emoji personnalisé d\'un autre serveur.')], ephemeral: true });
        }

        const animated = match[1] === 'a';
        const name = customName || match[2];
        const id = match[3];
        const url = `https://cdn.discordapp.com/emojis/${id}.${animated ? 'gif' : 'png'}`;

        try {
            const emoji = await interaction.guild.emojis.create({
                attachment: url,
                name: name,
            });

            const embed = new EmbedBuilder()
                .setTitle('😀 Emoji ajouté !')
                .setDescription(`L'emoji ${emoji} (\`${emoji.name}\`) a été ajouté au serveur.`)
                .setThumbnail(url)
                .setColor('#00ff00')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Impossible d\'ajouter cet emoji. Vérifiez que le serveur a encore de la place.')], ephemeral: true });
        }
    },
};
