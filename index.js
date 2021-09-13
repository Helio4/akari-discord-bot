const Discord = require("discord.js");
const config = require("./config.json");
const fs = require("fs");
const client = new Discord.Client();
const services = require("./data/services.js");
const aliases = require("./commands/aliases.json");

//Reads the events at the ./events/ folder
fs.readdir("./events/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
      let eventFunction = require(`./events/${file}`);
      let eventName = file.split(".")[0];
      client.on(eventName, (...args) => eventFunction.run(client, ...args));
    });
  });

//Message manager
client.on("message", async function(message){
    if(message.author.bot) return;
    if(message.channel.type === "dm") return;
    if(message.mentions.members.length >= 0 && message.mentions.members.first().user.bot) return;
    var guildConfig = await services.getGuild(message.guild); //Gets the guildConfig from the database
    var lang = require(`./strings/${guildConfig.lang}.json`);
    services.updateUserStats(message, guildConfig); //Checks and updates the author level
    if(!message.content.startsWith(guildConfig.prefix)) return;
    var args = message.content.substring(guildConfig.prefix.length).split(" ");
    var comm = args.shift().toLowerCase();
    try {
        let command = aliases.map[comm];
        let commandFile = require(`./commands/${command}.js`);
        var credentials = await services.getCommand(command, message.guild); //Gets de credentials for the command
        if(!credentials.enabled) return;
        if(!checkCredentials(message, credentials)) {
            message.reply(lang.credentials_denied);
            return;
        }
        commandFile.run(client, message, args, guildConfig);
    } catch (err) {
        message.channel.send(lang.no_command.replace("$1", comm));
        return;
    }
});

function checkCredentials(message, row) {
    if(message.author.id === message.guild.ownerID) return true;
    if(!row.restricted) return true;
    if(row.users.split(',').indexOf(message.author.id) >= 0) return true;
    for(var role of message.member.roles.array()) {
        if(row.roles.split(',').indexOf(role.id) >= 0) return true;
    }
    return false;
}

client.login(config.token);