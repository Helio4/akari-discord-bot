const services = require('../data/services.js');

exports.run = (client, message, [mod, ...msg], guildConfig) => {
    var lang = require(`../strings/${guildConfig.lang}.json`);
    if (mod === "set") {
        guildConfig.byeMsg = msg.join(" ");
        services.updateGuild(guildConfig);
        message.channel.send(lang.bmsg_changed.replace('$1', msg.join()));
        return;
    }
    if(mod === "toggle") {
        guildConfig.mod_bmsg = guildConfig.mod_bmsg === 1 ? 0 : 1;
        var status = guildConfig.mod_bmsg === 1 ? "ON" : "OFF";
        services.updateGuild(guildConfig);
        message.channel.send(lang.bmsg_toggle.replace('$1', status));
        return;
    }
    message.channel.send(lang.bmsg_current.replace('$1', guildConfig.byeMsg));
}

exports.config = {
    enabled:1,
    permLevel:"GuildOwner"
}

exports.help = {
    name:"bmsg",
    category:"Guild",
    usage:"bmsg [set <message>] [toggle]"
}