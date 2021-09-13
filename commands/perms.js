const services = require("../data/services.js");

exports.run = async (client, message, args, guildConfig) => {
    var lang = require(`../strings/${guildConfig.lang}.json`);
    if(!args[0]) {
        message.channel.send(lang.missing_args+"\n"+this.help.usage);
        return;
    }
    //MODULO add
    if(args[0] == "add" && args.length >= 3) {
        var row = await services.getCommand(args[1], message.guild).catch(console.error);
        if(row === undefined) {message.channel.send(lang.no_command.replace('$1', args[1])); return;}
        if(message.mentions.members.size === 0) {
            let role = message.guild.roles.find("name", args[2]);
            if(role !== null) {
                var roles = row.roles.length === 0? [] : row.roles.split(',');
                if(roles.indexOf(role.id) < 0) {roles.push(role.id); row.roles = roles.toString(); row.restricted = 1; services.updateCommand(row); message.channel.send(lang.perms_updated); return;}
                else {message.channel.send(lang.perms_role_has_already.replace('$1', args[2])); return;}
            } else {message.channel.send(lang.no_role.replace('$1', args[2])); return;} 
        } else {
            var user = message.mentions.members.first().user;
            if(user.bot) {
                message.channel.send(lang.perms_user_is_bot);
                return;
            }
            var users = row.users.length === 0? [] : row.users.split(',');
            if(users.indexOf(user.id) < 0) {
                users.push(user.id); 
                row.users = users.toString(); 
                row.restricted = 1; 
                services.updateCommand(row); 
                message.channel.send(lang.perms_updated); 
                return;
            }
            else {message.channel.send(lang.perms_user_has_already.replace('$1', user.username)); return;}
        }
    } else if (args[0] == "add" && args.length < 3) {
        message.channel.send(lang.missing_args+"\nperms add <command> <user/role>");
    } //END DEL MODULO add

    //MODULO remove
    if(args[0] == "remove" && args.length >= 3) {
        var row = await services.getCommand(args[1], message.guild).catch(console.error);
        if(row === undefined) {message.channel.send(lang.no_command.replace('$1', args[1])); return;}
        if(message.mentions.members.size === 0) {
            let role = message.guild.roles.find("name", args[2]);
            if(role !== undefined) {
                var roles = row.roles.length === 0? [] : row.roles.split(',');
                if(roles.indexOf(role.id) < 0) {message.channel.send(lang.perms_role_dont_have.replace('$1', args[2])); return;}
                else {                   
                    roles.splice(roles.indexOf(role.id), 1);
                    if(roles.length == 0 && row.users.length == 0) row.restricted = 0; //CHANGE THINGS WHEN DENY AND ALLOW ARE IMPLEMENTED
                    row.roles = roles.toString();
                    services.updateCommand(row);
                    message.channel.send(lang.perms_updated); 
                    return;
                }
            } else {message.channel.send(lang.no_role.replace('$1', args[2])); return;} 
        } else {
            var user = message.mentions.members.first().user;
            if(user.bot) {
                message.channel.send(lang.perms_user_is_bot);
                return;
            }
            var users = row.users.length === 0? [] : row.users.split(',');
            var j = users.indexOf(user.id) < 0;
            if(users.indexOf(user.id) < 0) {
                message.channel.send(lang.perms_user_dont_have.replace('$1', user.username)); 
                return;
            }
            else {
                users.splice(users.indexOf(user.id), 1);
                if(row.roles.length == 0 && users.length == 0) row.restricted = 0; //CHANGE THINGS WHEN DENY AND ALLOW ARE IMPLEMENTED
                row.users = users.toString();  
                services.updateCommand(row); 
                message.channel.send(lang.perms_updated); 
                return;
            }
        }        
    } else if (args[0] == "remove" && args.length < 3) {
        message.channel.send(lang.missing_args+"\nperms remove <command> <user/role>");
    } //END MODULO remove
}

exports.config = {
    enabled:1,
    permLevel:"GuildOwner"
}

exports.help = {
    name:"perms",
    category:"Guild",
    usage:"perms add <command> <user/role>\nperms remove <command> <user/role>\nperms deny <command> <user/role>\nperms allow <command> <user/role>"
}