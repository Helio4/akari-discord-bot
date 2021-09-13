const services = require('../data/services.js');

exports.run = async (client, message, args, guildConfig) => {
    var lang = require(`../strings/${guildConfig.lang}.json`);
    if (args.length == 0) {
        message.channel.send(lang.missing_args + "\n" + this.help.usage);
        return;
    }
    guildConfig.prefix = args[0];
    await services.updateGuild(guildConfig);
    message.channel.send(lang.prefix_changed.replace("$1", `${args[0]}`));
}

exports.config = {
    enabled:1,
    permLevel:"GuildOwner"
}

exports.help = {
    name:"prefix",
    category:"Guild",
    usage:"prefix <new_prefix>"
}