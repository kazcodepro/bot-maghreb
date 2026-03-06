const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../database/db');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isButton()) return;

        if (interaction.customId === 'giveaway_join') {
            const giveaway = db.getGiveawayByMessage(interaction.message.id);
            if (!giveaway) return interaction.reply({ content: 'Ce giveaway n\'existe plus.', ephemeral: true });

            const participants = giveaway.participants || [];
            if (participants.includes(interaction.user.id)) {
                const idx = participants.indexOf(interaction.user.id);
                participants.splice(idx, 1);
                db.updateGiveaway(giveaway.id, { participants });
                return interaction.reply({ content: 'Tu as quitté le giveaway.', ephemeral: true });
            }

            participants.push(interaction.user.id);
            db.updateGiveaway(giveaway.id, { participants });
            return interaction.reply({ content: 'Tu participes au giveaway ! 🎉', ephemeral: true });
        }

        if (interaction.customId === 'ticket_create') {
            const settings = db.getGuildSettings(interaction.guild.id);
            const existing = db.getOpenTicket(interaction.guild.id, interaction.user.id);
            if (existing) return interaction.reply({ content: 'Tu as déjà un ticket ouvert.', ephemeral: true });

            const channel = await interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                parent: settings.ticket_category || null,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: ['ViewChannel'] },
                    { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] },
                    ...(settings.ticket_support_role ? [{ id: settings.ticket_support_role, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] }] : []),
                ],
            });

            db.createTicket(interaction.guild.id, channel.id, interaction.user.id);

            const embed = new EmbedBuilder()
                .setTitle('🎫 Ticket Ouvert')
                .setDescription(`Bienvenue ${interaction.user} ! Décris ton problème et un membre du staff te répondra.`)
                .setColor(0x5865F2)
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('ticket_close_btn').setLabel('Fermer').setStyle(ButtonStyle.Danger).setEmoji('🔒'),
                new ButtonBuilder().setCustomId('ticket_claim_btn').setLabel('Claim').setStyle(ButtonStyle.Primary).setEmoji('🙋'),
            );

            await channel.send({ embeds: [embed], components: [row] });
            return interaction.reply({ content: `Ticket créé : ${channel}`, ephemeral: true });
        }

        if (interaction.customId === 'ticket_close_btn') {
            const ticket = db.getTicketByChannel(interaction.channel.id);
            if (!ticket) return interaction.reply({ content: 'Ce n\'est pas un ticket.', ephemeral: true });
            db.updateTicket(interaction.channel.id, { status: 'closed' });
            await interaction.reply({ content: '🔒 Ticket fermé. Ce salon sera supprimé dans 5 secondes.' });
            setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
        }

        if (interaction.customId === 'ticket_claim_btn') {
            const ticket = db.getTicketByChannel(interaction.channel.id);
            if (!ticket) return interaction.reply({ content: 'Ce n\'est pas un ticket.', ephemeral: true });
            if (ticket.claimed_by) return interaction.reply({ content: `Ce ticket est déjà claim par <@${ticket.claimed_by}>.`, ephemeral: true });
            db.updateTicket(interaction.channel.id, { claimed_by: interaction.user.id });
            return interaction.reply({ content: `🙋 ${interaction.user} a claim ce ticket.` });
        }
    },
};
