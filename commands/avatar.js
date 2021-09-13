const Discord = require('discord.js');

exports.run = async (client, message, args, guildConfig) => {
    const lang = require(`../strings/${guildConfig.lang}.json`);
    let member = message.mentions.members.size === 0 ? message.member : message.mentions.members.first();
    let embed = new Discord.RichEmbed().setColor("#f24646").setImage(member.user.displayAvatarURL).setTitle(lang.avatar_link).setURL(member.user.displayAvatarURL);
    embed.setAuthor(member.user.username + "#" + member.user.discriminator);
    message.channel.send(embed);
}

exports.config = {
    enabled: 1,
    permLevel: "User"
}

exports.help = {
    name: "avatar",
    category: "User",
    usage: "avatar [user]"
}