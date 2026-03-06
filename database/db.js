const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data.json');

const defaultData = {
    guild_settings: {},
    warnings: [],
    notes: [],
    sanctions: [],
    temp_bans: [],
    temp_mutes: [],
    afk_users: {},
    giveaways: [],
    invites_data: {},
    invite_codes: {},
    reminders: [],
    tickets: [],
    whitelist: {},
    blacklist: {},
    backups: {},
};

function loadDB() {
    try {
        if (fs.existsSync(DB_PATH)) {
            const raw = fs.readFileSync(DB_PATH, 'utf-8');
            return { ...defaultData, ...JSON.parse(raw) };
        }
    } catch {}
    return { ...defaultData };
}

function saveDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

let data = loadDB();

function save() {
    saveDB(data);
}

const defaultSettings = {
    prefix: '+',
    language: 'fr',
    log_channel: null,
    welcome_channel: null,
    welcome_message: '**Bienvenue {user} sur Hyuga 🎐 !**\n\n🥢 Nous sommes maintenant {membercount} sur le serveur grâce à toi !\n🌸 /maghrebunited en statut pour la perm image.\n\n**🌷 Souhaite-lui la bienvenue dans le serveur !**',
    welcome_enabled: 0,
    leave_channel: null,
    leave_message: '{user} a quitté **{server}**. Nous sommes maintenant {membercount} membres.',
    leave_enabled: 0,
    autorole: null,
    antiraid_enabled: 0,
    antispam_enabled: 0,
    antispam_limit: 5,
    antispam_interval: 5000,
    antilink_enabled: 0,
    antiinvite_enabled: 0,
    antimention_enabled: 0,
    antimention_limit: 5,
    anticaps_enabled: 0,
    anticaps_percent: 70,
    antiflood_enabled: 0,
    antialt_enabled: 0,
    antialt_days: 7,
    antinuke_enabled: 0,
    raidmode_enabled: 0,
    verification_enabled: 0,
    verification_channel: null,
    ticket_category: null,
    ticket_log_channel: null,
    ticket_support_role: null,
    invite_tracking: 0,
};

function getGuildSettings(guildId) {
    if (!data.guild_settings[guildId]) {
        data.guild_settings[guildId] = { ...defaultSettings };
        save();
    }
    return { ...defaultSettings, ...data.guild_settings[guildId] };
}

function updateGuildSetting(guildId, key, value) {
    if (!data.guild_settings[guildId]) {
        data.guild_settings[guildId] = { ...defaultSettings };
    }
    data.guild_settings[guildId][key] = value;
    save();
}

// --- warnings ---
let _warnIdCounter = (data.warnings || []).reduce((max, w) => Math.max(max, w.id || 0), 0);

function addWarning(guildId, userId, moderatorId, reason) {
    _warnIdCounter++;
    const entry = { id: _warnIdCounter, guild_id: guildId, user_id: userId, moderator_id: moderatorId, reason: reason || 'Aucune raison', created_at: new Date().toISOString() };
    data.warnings.push(entry);
    save();
    return entry;
}

function getWarnings(guildId, userId) {
    return data.warnings.filter(w => w.guild_id === guildId && w.user_id === userId);
}

function removeWarning(guildId, warnId) {
    const idx = data.warnings.findIndex(w => w.guild_id === guildId && w.id === warnId);
    if (idx === -1) return false;
    data.warnings.splice(idx, 1);
    save();
    return true;
}

function clearWarnings(guildId, userId) {
    data.warnings = data.warnings.filter(w => !(w.guild_id === guildId && w.user_id === userId));
    save();
}

// --- notes ---
let _noteIdCounter = (data.notes || []).reduce((max, n) => Math.max(max, n.id || 0), 0);

function addNote(guildId, userId, moderatorId, content) {
    _noteIdCounter++;
    const entry = { id: _noteIdCounter, guild_id: guildId, user_id: userId, moderator_id: moderatorId, content, created_at: new Date().toISOString() };
    data.notes.push(entry);
    save();
    return entry;
}

function getNotes(guildId, userId) {
    return data.notes.filter(n => n.guild_id === guildId && n.user_id === userId);
}

// --- sanctions ---
let _sanctionIdCounter = (data.sanctions || []).reduce((max, s) => Math.max(max, s.id || 0), 0);

function addSanction(guildId, userId, moderatorId, type, reason, duration) {
    _sanctionIdCounter++;
    const entry = { id: _sanctionIdCounter, guild_id: guildId, user_id: userId, moderator_id: moderatorId, type, reason: reason || 'Aucune raison', duration: duration || null, created_at: new Date().toISOString() };
    data.sanctions.push(entry);
    save();
    return entry;
}

function getSanctions(guildId, userId) {
    return data.sanctions.filter(s => s.guild_id === guildId && s.user_id === userId);
}

// --- temp bans ---
function addTempBan(guildId, userId, expiresAt) {
    data.temp_bans = data.temp_bans.filter(b => !(b.guild_id === guildId && b.user_id === userId));
    data.temp_bans.push({ guild_id: guildId, user_id: userId, expires_at: expiresAt });
    save();
}

function getExpiredTempBans(now) {
    return data.temp_bans.filter(b => b.expires_at <= now);
}

function removeTempBan(guildId, userId) {
    data.temp_bans = data.temp_bans.filter(b => !(b.guild_id === guildId && b.user_id === userId));
    save();
}

// --- temp mutes ---
function addTempMute(guildId, userId, expiresAt) {
    data.temp_mutes = data.temp_mutes.filter(m => !(m.guild_id === guildId && m.user_id === userId));
    data.temp_mutes.push({ guild_id: guildId, user_id: userId, expires_at: expiresAt });
    save();
}

function getExpiredTempMutes(now) {
    return data.temp_mutes.filter(m => m.expires_at <= now);
}

function removeTempMute(guildId, userId) {
    data.temp_mutes = data.temp_mutes.filter(m => !(m.guild_id === guildId && m.user_id === userId));
    save();
}

// --- afk ---
function setAfk(guildId, userId, reason) {
    if (!data.afk_users[guildId]) data.afk_users[guildId] = {};
    data.afk_users[guildId][userId] = { reason: reason || 'AFK', timestamp: Date.now() };
    save();
}

function getAfk(guildId, userId) {
    return data.afk_users[guildId]?.[userId] || null;
}

function removeAfk(guildId, userId) {
    if (data.afk_users[guildId]) {
        delete data.afk_users[guildId][userId];
        save();
    }
}

// --- giveaways ---
let _giveawayIdCounter = (data.giveaways || []).reduce((max, g) => Math.max(max, g.id || 0), 0);

function createGiveaway(guildId, channelId, messageId, hostId, prize, winnersCount, endsAt) {
    _giveawayIdCounter++;
    const entry = { id: _giveawayIdCounter, guild_id: guildId, channel_id: channelId, message_id: messageId, host_id: hostId, prize, winners_count: winnersCount, ends_at: endsAt, ended: 0, paused: 0, participants: [] };
    data.giveaways.push(entry);
    save();
    return entry;
}

function getGiveaway(id) {
    return data.giveaways.find(g => g.id === id) || null;
}

function getGiveawayByMessage(messageId) {
    return data.giveaways.find(g => g.message_id === messageId && !g.ended) || null;
}

function getActiveGiveaways(guildId) {
    return data.giveaways.filter(g => g.guild_id === guildId && !g.ended);
}

function getExpiredGiveaways(now) {
    return data.giveaways.filter(g => !g.ended && !g.paused && g.ends_at <= now);
}

function updateGiveaway(id, updates) {
    const g = data.giveaways.find(g => g.id === id);
    if (g) Object.assign(g, updates);
    save();
}

function deleteGiveaway(id) {
    data.giveaways = data.giveaways.filter(g => g.id !== id);
    save();
}

// --- invites ---
function getInviteData(guildId, userId) {
    const key = `${guildId}-${userId}`;
    return data.invites_data[key] || { guild_id: guildId, user_id: userId, inviter_id: null, fake: 0, leaves: 0, regular: 0 };
}

function setInviteData(guildId, userId, updates) {
    const key = `${guildId}-${userId}`;
    data.invites_data[key] = { ...getInviteData(guildId, userId), ...updates };
    save();
}

function getInviteLeaderboard(guildId) {
    return Object.values(data.invites_data)
        .filter(i => i.guild_id === guildId)
        .sort((a, b) => b.regular - a.regular)
        .slice(0, 10);
}

function resetInvites(guildId, userId) {
    if (userId) {
        delete data.invites_data[`${guildId}-${userId}`];
    } else {
        for (const key of Object.keys(data.invites_data)) {
            if (key.startsWith(`${guildId}-`)) delete data.invites_data[key];
        }
    }
    save();
}

// --- reminders ---
let _reminderIdCounter = (data.reminders || []).reduce((max, r) => Math.max(max, r.id || 0), 0);

function addReminder(userId, channelId, guildId, message, expiresAt) {
    _reminderIdCounter++;
    const entry = { id: _reminderIdCounter, user_id: userId, channel_id: channelId, guild_id: guildId, message, expires_at: expiresAt };
    data.reminders.push(entry);
    save();
    return entry;
}

function getExpiredReminders(now) {
    return data.reminders.filter(r => r.expires_at <= now);
}

function removeReminder(id) {
    data.reminders = data.reminders.filter(r => r.id !== id);
    save();
}

// --- tickets ---
let _ticketIdCounter = (data.tickets || []).reduce((max, t) => Math.max(max, t.id || 0), 0);

function createTicket(guildId, channelId, userId) {
    _ticketIdCounter++;
    const entry = { id: _ticketIdCounter, guild_id: guildId, channel_id: channelId, user_id: userId, claimed_by: null, status: 'open', created_at: new Date().toISOString() };
    data.tickets.push(entry);
    save();
    return entry;
}

function getTicketByChannel(channelId) {
    return data.tickets.find(t => t.channel_id === channelId && t.status === 'open') || null;
}

function getOpenTicket(guildId, userId) {
    return data.tickets.find(t => t.guild_id === guildId && t.user_id === userId && t.status === 'open') || null;
}

function updateTicket(channelId, updates) {
    const t = data.tickets.find(t => t.channel_id === channelId);
    if (t) Object.assign(t, updates);
    save();
}

// --- whitelist ---
function isWhitelisted(guildId, userId) {
    return !!data.whitelist[`${guildId}-${userId}`];
}

function addToWhitelist(guildId, userId) {
    data.whitelist[`${guildId}-${userId}`] = true;
    save();
}

function removeFromWhitelist(guildId, userId) {
    delete data.whitelist[`${guildId}-${userId}`];
    save();
}

// --- blacklist ---
function isBlacklisted(guildId, userId) {
    return data.blacklist[`${guildId}-${userId}`] || null;
}

function addToBlacklist(guildId, userId, reason) {
    data.blacklist[`${guildId}-${userId}`] = { reason: reason || 'Aucune raison' };
    save();
}

function removeFromBlacklist(guildId, userId) {
    delete data.blacklist[`${guildId}-${userId}`];
    save();
}

// --- backups ---
function createBackup(id, guildId, userId, backupData) {
    data.backups[id] = { id, guild_id: guildId, user_id: userId, data: backupData, created_at: new Date().toISOString() };
    save();
}

function getBackup(id) {
    return data.backups[id] || null;
}

function getBackupList(guildId) {
    return Object.values(data.backups).filter(b => b.guild_id === guildId);
}

function deleteBackup(id) {
    delete data.backups[id];
    save();
}

module.exports = {
    getGuildSettings, updateGuildSetting,
    addWarning, getWarnings, removeWarning, clearWarnings,
    addNote, getNotes,
    addSanction, getSanctions,
    addTempBan, getExpiredTempBans, removeTempBan,
    addTempMute, getExpiredTempMutes, removeTempMute,
    setAfk, getAfk, removeAfk,
    createGiveaway, getGiveaway, getGiveawayByMessage, getActiveGiveaways, getExpiredGiveaways, updateGiveaway, deleteGiveaway,
    getInviteData, setInviteData, getInviteLeaderboard, resetInvites,
    addReminder, getExpiredReminders, removeReminder,
    createTicket, getTicketByChannel, getOpenTicket, updateTicket,
    isWhitelisted, addToWhitelist, removeFromWhitelist,
    isBlacklisted, addToBlacklist, removeFromBlacklist,
    createBackup, getBackup, getBackupList, deleteBackup,
};
