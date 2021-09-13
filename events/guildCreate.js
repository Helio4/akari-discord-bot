const services = require('../data/services.js');

exports.run = (client, guild) => {
    services.addGuild(guild);   
}