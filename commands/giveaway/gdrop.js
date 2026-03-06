const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gdrop')
        .setDescription('Drop giveaway - Le premier à cliquer gagne !')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption(option =>
            option.setName('prix')
                .setDescription('Le prix du drop')
                .setRequired(true)),
    cooldown: 5,
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({ embeds: [errorEmbed('Tu n\'as pas la permission d\'utiliser cette commande.')] });
        }

        const prize = interaction.options.getString('prix');

        const embed = new EmbedBuilder()
            .setTitle('🎁 DROP GIVEAWAY 🎁')
            .setDescription(`**${prize}**\n\n🏃 Le premier à cliquer sur le bouton gagne !\n\n👤 Organisé par : ${interaction.user}`)
            .setColor('#FFD700')
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('gdrop_claim')
                .setLabel('🎁 Récupérer !')
                .setStyle(ButtonStyle.Success)
        );

        await interaction.reply({ embeds: [successEmbed(`Drop giveaway lancé ! 🎁\n**Prix :** ${prize}`)], ephemeral: true });
        const msg = await interaction.channel.send({ embeds: [embed], components: [row] });

        const collector = msg.createMessageComponentCollector({
            filter: i => i.customId === 'gdrop_claim',
            max: 1,
            time: 300_000
        });

        collector.on('collect', async i => {
            collector.stop('claimed');

            const disabledRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('gdrop_claim')
                    .setLabel('🎁 Récupéré !')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true)
            );

            embed.setTitle('🎁 DROP GIVEAWAY - TERMINÉ 🎁')
                .setDescription(`**${prize}**\n\n🎉 **Gagnant :** ${i.user}\n👤 Organisé par : ${interaction.user}`)
                .setColor('#00FF00');

            await i.update({ embeds: [embed], components: [disabledRow] });
            await interaction.channel.send(`🎉 Félicitations ${i.user} ! Vous avez gagné **${prize}** !`);
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                const disabledRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('gdrop_claim')
                        .setLabel('🎁 Expiré')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true)
                );

                embed.setDescription(`**${prize}**\n\n⏰ Personne n'a réclamé le prix à temps !`)
                    .setColor('#FF0000');

                msg.edit({ embeds: [embed], components: [disabledRow] }).catch(() => {});
            }
        });
    },
};
