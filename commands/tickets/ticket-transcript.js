const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/functions');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-transcript')
        .setDescription('Générer une transcription du ticket actuel'),
    cooldown: 10,
    async execute(interaction, client) {
        const ticket = db.getTicketByChannel(interaction.channel.id);

        if (!ticket) {
            return interaction.reply({ embeds: [errorEmbed('Cette commande doit être utilisée dans un ticket.')], ephemeral: true });
        }

        await interaction.deferReply();

        try {
            const messages = await interaction.channel.messages.fetch({ limit: 100 });
            const sorted = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

            let transcript = `=== Transcription du Ticket ===\n`;
            transcript += `Serveur : ${interaction.guild.name}\n`;
            transcript += `Salon : #${interaction.channel.name}\n`;
            transcript += `Date : ${new Date().toLocaleString('fr-FR')}\n`;
            transcript += `${'='.repeat(40)}\n\n`;

            sorted.forEach(msg => {
                const time = new Date(msg.createdTimestamp).toLocaleString('fr-FR');
                transcript += `[${time}] ${msg.author.tag}: ${msg.content || '[Pas de contenu]'}`;
                if (msg.attachments.size > 0) {
                    transcript += ` [Pièces jointes: ${msg.attachments.map(a => a.url).join(', ')}]`;
                }
                if (msg.embeds.length > 0) {
                    transcript += ` [${msg.embeds.length} embed(s)]`;
                }
                transcript += '\n';
            });

            const buffer = Buffer.from(transcript, 'utf-8');
            const attachment = new AttachmentBuilder(buffer, { name: `transcript-${interaction.channel.name}.txt` });

            await interaction.editReply({
                embeds: [successEmbed('Transcription générée avec succès.')],
                files: [attachment]
            });
        } catch {
            await interaction.editReply({ embeds: [errorEmbed('Une erreur est survenue lors de la génération de la transcription.')] });
        }
    },
};
