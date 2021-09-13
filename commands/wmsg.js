const services = require('../data/services.js');

exports.run = (client, message, [mod, ...msg], guildConfig) => {
    var lang = require(`../strings/${guildConfig.lang}.json`);
    if (mod === "set") {
        guildConfig.welMsg = msg.join(" ");
        services.updateGuild(guildConfig);
        message.channel.send(lang.wmsg_changed.replace('$1', msg.join()));
        return;
    }
    if(mod === "toggle") {
        guildConfig.mod_wmsg = guildConfig.mod_wmsg === 1 ? 0 : 1;
        var status = guildConfig.mod_wmsg === 1 ? "ON" : "OFF";
        services.updateGuild(guildConfig);
        message.channel.send(lang.wmsg_toggle.replace('$1', status));
        return;
    }
    message.channel.send(lang.wmsg_current.replace('$1', guildConfig.welMsg));
}

exports.config = {
    enabled:1,
    permLevel:"GuildOwner"
}

exports.help = {
    name:"wmsg",
    category:"Guild",
    usage:"wmsg [set <message>] [toggle]"
}