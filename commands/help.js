const Discord = require('discord.js');
const fs = require('fs');

exports.run = (client, message, args, guildConfig) => {
    var embed = new Discord.RichEmbed().setColor("#f24646");
    const lang = require(`../strings/${guildConfig.lang}.json`);
    if(!args[0]) {
        embed.setAuthor("Akarin Help", client.user.displayAvatarURL); //Maybe a future link to some documentation will be nice
        let files = fs.readdirSync(__dirname);
        files = files.filter(file => file.endsWith('.js'));
        let categories = new Map();
        files.forEach(file => {
            let command = require(`./${file}`);
            let category = command.help.category;
            let s = categories.has(category) ? categories.get(category) + ',' + command.help.name : command.help.name;
            categories.set(category, s);
        });
        categories.forEach((value, key, mapObj) => {
            embed.addField(key, value);
        });
    } else {
        const aliases = require('./aliases.json');
        try {
            let commandName = aliases.map[args[0]];
            let command = require(`./${commandName}.js`);
            let alias = "";
            embed.setAuthor(lang.help_header.replace('$1', commandName), client.user.displayAvatarURL);
            embed.addField(lang.help_description_field, lang[`${commandName}_desc`]);
            embed.addField(lang.help_usage_field, command.help.usage);
            for(let x in aliases.map) {
                if(aliases.map[x] == commandName && x != commandName) alias += ", " + x;
            }
            if(alias !== "") {
                alias = alias.substring(1);
                embed.addField(lang.help_aliases_field, alias);
            }
        } catch (err) {
            message.channel.send(lang.no_command.replace('$1', args[0]));
            return;
        }
    }
    message.channel.send(embed);
}

exports.config = {
    enabled:1,
    permLevel:"User"
}

exports.help = {
    name:"help",
    category:"Miscelaneous",
    usage:"help [command]"
}