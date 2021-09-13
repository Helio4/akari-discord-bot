exports.run = (client, message, args, guildConfig) => {
    const lang = require(`../strings/${guildConfig.lang}.json`);
    if(!args[0]) return message.channel.send(lang["8ball_no_question"]);
    let question = args.join(' ');
    let answers = lang["8ball_answers"];
    let random = Math.floor(Math.random() * (20))
    let res = ':8ball: *' + answers[random] + '*';
    message.channel.send(res);
}

exports.config = {
    enabled: 1,
    permLevel: "User"
}

exports.help = {
    name: "8ball",
    category: "Fun",
    usage: "8ball <question>"
}