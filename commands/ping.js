exports.run = (client, message) => {
    message.channel.send("Pong!").catch(console.error);
}

exports.config = {
    enabled:1,
    permLevel:"User"
}

exports.help = {
    name:"ping",
    category:"Miscelaneous",
    usage:"ping"
}