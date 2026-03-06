const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guess')
        .setDescription('Devinez un nombre entre 1 et 100 - Vous avez 7 essais'),
    cooldown: 5,
    async execute(interaction, client) {
        const target = Math.floor(Math.random() * 100) + 1;
        let tries = 7;
        const guesses = [];

        const embed = new EmbedBuilder()
            .setTitle('🔢 Devinez le nombre !')
            .setDescription('J\'ai choisi un nombre entre **1** et **100**.\nTapez un nombre dans le chat pour deviner !')
            .addFields({ name: '❤️ Essais restants', value: `${tries}/7` })
            .setColor('#5865F2')
            .setFooter({ text: 'Vous avez 60 secondes !' });

        const msg = await interaction.reply({ embeds: [embed], fetchReply: true });

        const collector = interaction.channel.createMessageCollector({
            filter: m => m.author.id === interaction.user.id && !isNaN(m.content.trim()),
            time: 60_000
        });

        collector.on('collect', async m => {
            const num = parseInt(m.content.trim());
            m.delete().catch(() => {});

            if (num < 1 || num > 100) return;

            tries--;
            guesses.push(num);

            if (num === target) {
                collector.stop('won');
                embed.setDescription(`🎉 **Félicitations !** Le nombre était bien **${target}** !\nTrouvé en **${7 - tries}** essai(s) !`)
                    .setColor('#00FF00')
                    .setFields(
                        { name: '📝 Vos essais', value: guesses.join(', ') }
                    );
                return msg.edit({ embeds: [embed] });
            }

            const hint = num > target ? '📉 **Trop haut !**' : '📈 **Trop bas !**';

            if (tries <= 0) {
                collector.stop('lost');
                embed.setDescription(`💀 **Perdu !** Le nombre était **${target}** !\n${hint}`)
                    .setColor('#FF0000')
                    .setFields(
                        { name: '📝 Vos essais', value: guesses.join(', ') }
                    );
                return msg.edit({ embeds: [embed] });
            }

            embed.setDescription(`${hint}\nTapez un autre nombre !`)
                .setFields(
                    { name: '❤️ Essais restants', value: `${tries}/7`, inline: true },
                    { name: '📝 Vos essais', value: guesses.join(', '), inline: true }
                )
                .setColor(tries > 3 ? '#FFA500' : '#FF0000');

            await msg.edit({ embeds: [embed] });
        });

        collector.on('end', (_, reason) => {
            if (reason === 'time') {
                embed.setDescription(`⏰ Temps écoulé ! Le nombre était **${target}**.`)
                    .setColor('#FF0000');
                msg.edit({ embeds: [embed] }).catch(() => {});
            }
        });
    },
};
