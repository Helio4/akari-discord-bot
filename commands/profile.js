const Discord = require('discord.js');
const services = require('../data/services.js');

exports.run = async (client, message, args, guildConfig) => {
    const lang = require(`../strings/${guildConfig.lang}.json`);
    let member = message.mentions.members.size === 0 ? message.member : message.mentions.members.first();
    if(member.user.bot) return message.channel.send(lang.profile_is_a_bot);
    let row = await services.getUser(member.user, message.guild);
    let status = statusInfo(member.user.presence, client);
    let embed = new Discord.RichEmbed().setColor(status.color).setThumbnail(member.user.displayAvatarURL);
    embed.setAuthor(member.user.username + "#" + member.user.discriminator, status.emoji);
    embed.addField(lang.profile_level, row.level, true).addField(lang.profile_experience, row.score +  "/" + (30 + 20 * row.level), true);
    let game = member.user.presence.game ? member.user.presence.game.name : lang.profile_nothing;
    embed.addField(lang.profile_num_msg, row.num_msg, true).addField(lang.profile_playing, game, true);
    let nickname = member.nickname ? member.nickname : lang.profile_no_nickname;
    embed.addField(lang.profile_mention, member, true).addField(lang.profile_nickname, nickname, true);
    embed.addField(lang.profile_joined, member.joinedAt.toUTCString() + " (UTC)");
    let roles = member.roles.array().map(role => role.name).join(', ');
    embed.addField(lang.profile_roles, roles);
    message.channel.send(embed);
}

exports.config = {
    enabled: 1,
    permLevel: "User"
}

exports.help = {
    name: "profile",
    category: "User",
    usage: "profile [user]"
}

function statusInfo(presence, client) {
    if(presence.game && presence.game.streaming == true) return {'emoji':client.emojis.find('id','404295978980605953').url, 'color':'#513c74'};
    if(presence.status === 'online') return {'emoji':client.emojis.find('id', '404295276548063232').url, 'color':'#43b581'};
    if(presence.status === 'offline') return {'emoji':client.emojis.find('id', '404297783265460224').url, 'color':'#7e7e7e'};
    if(presence.status === 'idle') return {'emoji':client.emojis.find('id','404298287944826890').url, 'color':'#faa61a'};
    if(presence.status === 'dnd') return {'emoji':client.emojis.find('id','404290348731334656').url, 'color':'#a13027'};
}