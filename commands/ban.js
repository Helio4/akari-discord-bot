const services = require('../data/services.js');

exports.run = async(client, message, [user, ...reason], guildConfig) => {
    var lang = require(`../strings/${guildConfig.lang}.json`);
    if (!message.guild.me.permissions.has("BAN_MEMBERS")) {
        message.channel.send(lang.i_dont_have_permission.replace('$1', "BAN_MEMBERS"));
        return;
    }
    if (message.mentions.members.size === 0) {
        message.channel.send(lang.missing_args + "\n" + this.help.usage);
        return;
    }
    var member = message.mentions.members.first();
    if (member.user.id === message.guild.ownerId) {
        message.channel.send(lang.ban_guild_owner);
        return;
    }
    var msg = reason === undefined ? "" : reason.join(" ");
    member.ban(msg);
    message.channel.send(lang.ban_done.replace('$1', member));
}

exports.config = {
    enabled: 1,
    permLevel: "GuildOwner"
}

exports.help = {
    name: "ban",
    category: "Guild",
    usage: "ban <User> [reason]"
}