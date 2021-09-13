const services = require('../data/services.js');

exports.run = async (client, guildMember) => {
    if(guildMember.user.bot) return;
    var guildConfig = await services.getGuild(guildMember.guild);
    if(guildConfig.mod_bmsg === 0) return;
    var defChan = services.getDefChannel(guildMember.guild, guildMember);
    if(defChan !== undefined) defChan.send(guildConfig.byeMsg.replace("<USER>", guildMember));
}