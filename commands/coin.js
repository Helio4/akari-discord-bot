exports.run = (client, message, args, guildConfig) => {
    const lang = require(`../strings/${guildConfig.lang}.json`)
    let random = Math.floor(Math.random() * (2));
    let res = random === 0 ? lang.coin_heads : lang.coin_tails;
    message.channel.send(res);
}

exports.config = {
    enabled: 1,
    permLevel: "User"
}

exports.help = {
    name: "coin",
    category: "Fun",
    usage: "coin"
}