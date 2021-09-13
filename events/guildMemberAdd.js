const services = require('../data/services.js');

exports.run = async (client, guildMember) => {
    if(guildMember.user.bot) return;
    services.getUser(guildMember.user, guildMember.guild);
    var guildConfig = await services.getGuild(guildMember.guild);
    if(guildConfig.mod_wmsg === 0) return;
    var defChan = services.getDefChannel(guildMember.guild, guildMember);
    if(defChan !== undefined) defChan.send(guildConfig.welMsg.replace("<USER>", guildMember.user));
}