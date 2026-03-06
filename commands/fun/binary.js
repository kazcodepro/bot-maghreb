const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('binary')
        .setDescription('Convertir du texte en binaire')
        .addStringOption(option =>
            option.setName('texte')
                .setDescription('Le texte à convertir')
                .setRequired(true)),
    cooldown: 3,
    async execute(interaction, client) {
        const texte = interaction.options.getString('texte');
        const binary = [...texte].map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');

        if (binary.length > 1900) {
            return interaction.reply({ content: '❌ Le résultat est trop long pour être affiché.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor('#2ECC71')
            .setTitle('💻 Texte en binaire')
            .addFields(
                { name: 'Texte', value: texte },
                { name: 'Binaire', value: `\`\`\`\n${binary}\n\`\`\`` }
            )
            .setFooter({ text: `Demandé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
