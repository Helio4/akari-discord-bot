const services = require('../data/services.js');

exports.run = async (client, message, args, guildConfig) => { 
    let lang = require(`../strings/${guildConfig.lang}.json`);
    try {
        var newlang = require(`../strings/${args[0]}.json`);
    } catch (err) {
        message.channel.send(lang.lang_not_found);
        return;
    }
    guildConfig.lang = args[0];
    await services.updateGuild(guildConfig);
    message.channel.send(newlang.lang_changed.replace("$1", newlang.lang_name));
}

exports.config = {
    enabled:1,
    permLevel:"GuildOwner"
}

exports.help = {
    name:"lang",
    category:"Guild",
    usage:"lang <language>"
}