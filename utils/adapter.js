const { Collection } = require('discord.js');

class MessageAdapter {
    constructor(message, args, command) {
        this.message = message;
        this.args = args;
        this.user = message.author;
        this.member = message.member;
        this.guild = message.guild;
        this.channel = message.channel;
        this.client = message.client;
        this.replied = false;
        this.deferred = false;
        this._reply = null;

        this.options = new OptionsResolver(message, args, command.data?.toJSON?.() || {});
    }

    async reply(options) {
        this.replied = true;
        if (typeof options === 'string') options = { content: options };
        if (options.ephemeral) delete options.ephemeral;
        this._reply = await this.message.reply(options);
        return this._reply;
    }

    async editReply(options) {
        if (typeof options === 'string') options = { content: options };
        if (this._reply) return this._reply.edit(options);
        return this.message.reply(options);
    }

    async followUp(options) {
        if (typeof options === 'string') options = { content: options };
        if (options.ephemeral) delete options.ephemeral;
        return this.channel.send(options);
    }

    async deferReply() {
        this.deferred = true;
        this._reply = await this.message.reply('⏳ Chargement...');
    }

    async deleteReply() {
        if (this._reply) return this._reply.delete().catch(() => {});
    }

    async fetchReply() {
        return this._reply;
    }
}

class OptionsResolver {
    constructor(message, args, commandData) {
        this.message = message;
        this.args = args;
        this.commandData = commandData;
        this.options = commandData.options || [];
    }

    _getOptionIndex(name) {
        return this.options.findIndex(o => o.name === name);
    }

    _getArg(name) {
        const idx = this._getOptionIndex(name);
        if (idx === -1) return this.args.find(a => a) || null;
        return this.args[idx] || null;
    }

    _getRemainingArgs(name) {
        const idx = this._getOptionIndex(name);
        if (idx === -1) return this.args.join(' ') || null;
        return this.args.slice(idx).join(' ') || null;
    }

    getSubcommand(required = true) {
        return null;
    }

    getString(name, required = false) {
        const opt = this.options.find(o => o.name === name);
        const idx = this._getOptionIndex(name);

        if (opt && opt.type === 3) {
            const isLast = idx === this.options.length - 1;
            const isOnlyString = this.options.filter(o => o.type === 3).length === 1;
            if (isLast || isOnlyString) {
                const remaining = this.args.slice(idx).join(' ');
                return remaining || null;
            }
        }

        return this._getArg(name);
    }

    getInteger(name, required = false) {
        const val = this._getArg(name);
        if (val === null) return null;
        const num = parseInt(val);
        return isNaN(num) ? null : num;
    }

    getNumber(name, required = false) {
        const val = this._getArg(name);
        if (val === null) return null;
        const num = parseFloat(val);
        return isNaN(num) ? null : num;
    }

    getBoolean(name, required = false) {
        const val = this._getArg(name);
        if (val === null) return null;
        return ['true', 'oui', 'yes', '1', 'on'].includes(val.toLowerCase());
    }

    getUser(name, required = false) {
        const val = this._getArg(name);
        if (!val) return null;

        const match = val.match(/^<@!?(\d+)>$/) || val.match(/^(\d{17,20})$/);
        if (match) {
            return this.message.client.users.cache.get(match[1]) || null;
        }

        const byName = this.message.guild?.members.cache.find(m =>
            m.user.username.toLowerCase() === val.toLowerCase() ||
            m.displayName.toLowerCase() === val.toLowerCase()
        );
        return byName?.user || null;
    }

    getMember(name, required = false) {
        const val = this._getArg(name);
        if (!val) return null;

        const match = val.match(/^<@!?(\d+)>$/) || val.match(/^(\d{17,20})$/);
        if (match) {
            return this.message.guild?.members.cache.get(match[1]) || null;
        }

        return this.message.guild?.members.cache.find(m =>
            m.user.username.toLowerCase() === val.toLowerCase() ||
            m.displayName.toLowerCase() === val.toLowerCase()
        ) || null;
    }

    getChannel(name, required = false) {
        const val = this._getArg(name);
        if (!val) return null;

        const match = val.match(/^<#(\d+)>$/) || val.match(/^(\d{17,20})$/);
        if (match) {
            return this.message.guild?.channels.cache.get(match[1]) || null;
        }

        return this.message.guild?.channels.cache.find(c =>
            c.name.toLowerCase() === val.toLowerCase()
        ) || null;
    }

    getRole(name, required = false) {
        const val = this._getArg(name);
        if (!val) return null;

        const match = val.match(/^<@&(\d+)>$/) || val.match(/^(\d{17,20})$/);
        if (match) {
            return this.message.guild?.roles.cache.get(match[1]) || null;
        }

        return this.message.guild?.roles.cache.find(r =>
            r.name.toLowerCase() === val.toLowerCase()
        ) || null;
    }

    getMentionable(name, required = false) {
        return this.getUser(name) || this.getRole(name) || null;
    }

    getAttachment(name, required = false) {
        return this.message.attachments.first() || null;
    }
}

module.exports = { MessageAdapter };
