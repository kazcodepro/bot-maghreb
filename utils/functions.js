const { EmbedBuilder } = require('discord.js');
const config = require('../config');

function successEmbed(description) {
    return new EmbedBuilder()
        .setColor(config.colors.success)
        .setDescription(`${config.emojis.success} ${description}`);
}

function errorEmbed(description) {
    return new EmbedBuilder()
        .setColor(config.colors.danger)
        .setDescription(`${config.emojis.error} ${description}`);
}

function warningEmbed(description) {
    return new EmbedBuilder()
        .setColor(config.colors.warning)
        .setDescription(`${config.emojis.warning} ${description}`);
}

function infoEmbed(description) {
    return new EmbedBuilder()
        .setColor(config.colors.info)
        .setDescription(`${config.emojis.info} ${description}`);
}

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const parts = [];
    if (days > 0) parts.push(`${days}j`);
    if (hours % 24 > 0) parts.push(`${hours % 24}h`);
    if (minutes % 60 > 0) parts.push(`${minutes % 60}m`);
    if (seconds % 60 > 0) parts.push(`${seconds % 60}s`);
    return parts.join(' ') || '0s';
}

function truncate(str, max = 1024) {
    return str.length > max ? str.slice(0, max - 3) + '...' : str;
}

function parseDuration(str) {
    const match = str.match(/^(\d+)(s|m|h|d|w)$/);
    if (!match) return null;
    const num = parseInt(match[1]);
    const unit = match[2];
    const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000, w: 604800000 };
    return num * multipliers[unit];
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function replacePlaceholders(text, member, guild) {
    return text
        .replace(/{user}/g, member.toString())
        .replace(/{username}/g, member.user?.username || member.username || 'Unknown')
        .replace(/{tag}/g, member.user?.tag || member.tag || 'Unknown')
        .replace(/{server}/g, guild.name)
        .replace(/{membercount}/g, guild.memberCount.toString())
        .replace(/{id}/g, member.id);
}

module.exports = {
    successEmbed,
    errorEmbed,
    warningEmbed,
    infoEmbed,
    formatDuration,
    truncate,
    parseDuration,
    randomInt,
    shuffle,
    replacePlaceholders,
};
