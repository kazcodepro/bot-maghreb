const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('calc')
        .setDescription('Calculatrice mathématique sécurisée')
        .addStringOption(option =>
            option.setName('expression')
                .setDescription('L\'expression mathématique (ex: 2+2, 5*3, 10/2, 2^8)')
                .setRequired(true)),
    cooldown: 3,
    async execute(interaction, client) {
        const expression = interaction.options.getString('expression');

        const sanitized = expression.replace(/\s/g, '');
        if (!/^[0-9+\-*/().%^]+$/.test(sanitized)) {
            return interaction.reply({ embeds: [errorEmbed('Expression invalide. Utilisez uniquement des chiffres et les opérateurs `+`, `-`, `*`, `/`, `%`, `^`, `(`, `)`.')], ephemeral: true });
        }

        try {
            const prepared = sanitized.replace(/\^/g, '**');
            const calculate = new Function(`"use strict"; return (${prepared});`);
            const result = calculate();

            if (typeof result !== 'number' || !isFinite(result)) {
                return interaction.reply({ embeds: [errorEmbed('Le résultat n\'est pas un nombre valide.')], ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle('🔢 Calculatrice')
                .addFields(
                    { name: 'Expression', value: `\`${expression}\``, inline: true },
                    { name: 'Résultat', value: `\`${result}\``, inline: true }
                )
                .setColor('#5865F2')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch {
            await interaction.reply({ embeds: [errorEmbed('Impossible de calculer cette expression.')], ephemeral: true });
        }
    },
};
