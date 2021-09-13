const services = require('../data/services.js');

exports.run = async (client, message, args, guildConfig) => {
    var lang = require(`../strings/${guildConfig.lang}.json`);
    if(!args[0]) {
        message.channel.send(lang.missing_args+"\n"+this.help.usage);
        return;
    }
    if (args[0] == "help") {
        message.channel.send(this.help.usage);
        return;
    }
    if(args[0] == "toggle") {
        guildConfig.mod_level = guildConfig.mod_level == 1 ? 0 : 1;
        var status = guildConfig.mod_level == 1 ? "ON" : "OFF";
        services.updateGuild(guildConfig);
        message.channel.send(lang.level_toggle.replace('$1', status));
        return;
    }
    //MODULO add
    if(args[0] == "add" && args.length >= 3) {
        var level = parseInt(args[1]);
        if(isNaN(level)) {
            message.channel.send(lang.not_a_number.replace('$1', args[1]));
            return;
        }
        let role = message.guild.roles.find("name", args[2]);
        if(role !== null) {
            var row = await services.getReward(level, message.guild);
            var roles = row.roles.length === 0? [] : row.roles.split(',');
            if(roles.indexOf(role.id) < 0) {roles.push(role.id); row.roles = roles.toString(); services.updateReward(row); message.channel.send(lang.level_reward_updated); return;}
            else {message.channel.send(lang.level_role_has_already.replace('$1', args[2]).replace('$1', args[1])); return;}
        } else {message.channel.send(lang.no_role.replace('$1', args[2])); return;} 
    } else if (args[0] == "add" && args.length < 3) {
        message.channel.send(lang.missing_args+"\nlevel add <level> <role>");
        return;
    } //END DEL MODULO add

    //MODULO remove
    if(args[0] == "remove" && args.length >= 2) {
        var level = parseInt(args[1]);
        if(isNaN(level)) {
            message.channel.send(lang.not_a_number.replace('$1', args[1]));
            return;
        }
        let role = args[2] != undefined ? message.guild.roles.find("name", args[2]) : undefined;
        if(role !== null & role != undefined) {
            var row = await services.getReward(level, message.guild);
            var roles = row.roles.length === 0? [] : row.roles.split(',');
            if(roles.indexOf(role.id) >= 0) {
                roles.splice(roles.indexOf(role.id), 1); 
                row.roles = roles.toString(); 
                if(row.roles === "") services.delReward(level, message.guild);
                else services.updateReward(row); 
                message.channel.send(lang.level_reward_updated); 
            }
            else {
                message.channel.send(lang.level_role_dont_have.replace('$1', args[2]).replace('$1', args[1]));
            }
            return;
        }
        if (role === null) {
            message.channel.send(lang.no_role.replace('$1', args[2]));
        } else {
            services.delReward(level, message.guild);
            message.channel.send(lang.level_all_removed.replace('$1', level));
        }   
        return;
    } else if (args[0] == "remove" && args.length < 2) {
        message.channel.send(lang.missing_args+"\nlevel remove <level> [role]");
        return;
    } //END MODULO remove

    var level = parseInt(args[0]);
    if(isNaN(level)) {
        message.channel.send(lang.not_a_number.replace('$1', args[0]));
        return;
    }
    var row = await services.getReward(level, message.guild, false);
    if(!row) message.channel.send(lang.level_no_rewards.replace('$1', level));
    else {
        var roles = row.roles.length === 0? [] : row.roles.split(',');
        var s = "";
        for (var i = 0; i < roles.length; i++) {
            let role = message.guild.roles.find("id", roles[i]);
            s += " - " + role.name + "\n";
        }
        message.channel.send(lang.level_rewards.replace('$1', level) + "\n" + s);
    }
}

exports.config = {
    enabled:1,
    permLevel:"GuildOwner"
}

exports.help = {
    name:"level",
    category:"Guild",
    usage:"level add <level> <role>\nlevel remove <level> [role]\nlevel <level>"
}