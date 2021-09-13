const services = require("../data/services.js");

exports.run = async (client, message, args, guildConfig) => {
    var lang = require(`../strings/${guildConfig.lang}`);
    if(args.length < 1) {message.channel.send(lang.missing_args+"\n"+this.help.usage); return;}
    if(args[0] === "toggle") return;
    var row = await services.getCommand(args[0], message.guild);
    if(row === undefined) {message.channel.send(lang.no_command.replace('$1', args[0])); return;}
    row.enabled = row.enabled == 1 ? 0 : 1;
    var status = row.enabled == 1 ? "ON" : "OFF";
    services.updateCommand(row);
    message.channel.send(lang.toggle_is_now.replace('$1', args[0]).replace('$2', status));  
}

exports.config = {
    enabled:1,
    permLevel:"GuildOwner"
}

exports.help = {
    name:"toggle",
    category:"Guild",
    usage:"toggle <command>"
}