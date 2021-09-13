const sql = require('sqlite');
const config = require('../config.json');
const services = require('../data/services.js');
exports.run = (client) => {  
    sql.open("./data/db.sqlite", {cached: true}).then( () => {
        console.log(' - Database opened.');   
        sql.run("CREATE TABLE IF NOT EXISTS guilds (guildId VARCHAR(18), prefix VARCHAR(10) NOT NULL, lang VARCHAR(20) NOT NULL, welMsg VARCHAR(120) NOT NULL, byeMsg VARCHAR(120) NOT NULL, mod_wmsg INTEGER NOT NULL CHECK (mod_wmsg == 1 OR mod_wmsg == 0) DEFAULT 1, mod_bmsg INTEGER NOT NULL CHECK (mod_bmsg == 1 OR mod_bmsg == 0) DEFAULT 1,mod_level INTEGER NOT NULL CHECK (mod_level == 1 OR mod_level == 0) DEFAULT 1, PRIMARY KEY (guildId))")
        .catch(console.error);
        sql.run("CREATE TABLE IF NOT EXISTS users (userId VARCHAR(18), guildId VARCHAR(18), score INTEGER NOT NULL DEFAULT 0, level INTEGER NOT NULL DEFAULT 1, num_msg INTEGER NOT NULL DEFAULT 0, join_date DATETIME NOT NULL, PRIMARY KEY (userId, guildId), FOREIGN KEY (guildId) REFERENCES guilds(guildId) ON DELETE CASCADE)")
        .catch(console.error);
        sql.run("CREATE TABLE IF NOT EXISTS commands (name VARCHAR(30), guildId VARCHAR(18), enabled INTEGER NOT NULL CHECK(enabled == 1 OR enabled == 0), restricted INTEGER NOT NULL CHECK(restricted == 1 OR restricted == 0), roles TEXT NOT NULL, users TEXT NOT NULL, PRIMARY KEY (name, guildId), FOREIGN KEY (guildId) REFERENCES guilds(guildId) ON DELETE CASCADE)")
        .catch(console.error);
        sql.run("CREATE TABLE IF NOT EXISTS level_rewards (level INTEGER NOT NULL, guildId VARCHAR(18), roles TEXT NOT NULL, PRIMARY KEY (level, guildId), FOREIGN KEY (guildId) REFERENCES guilds (guildId) ON DELETE CASCADE)")
        .catch(console.error);
    }).catch(console.error); 
    client.user.setGame(`${config.prefix}help`);
    console.log(` - Ready to serve in ${client.channels.size} channels on ${client.guilds.size} servers, for total of ${client.users.size} users.`);
};

/*
Esquema DB

TABLE guilds
    guildId TEXT PRIMARY KEY
    prefix TEXT NOT NULL
    lang TEXT NOT NULL
    welMsg TEXT NOT NULL
    byeMsg TEXT NOT NULL

TABLE users
    userId TEXT PRIMARY KEY
    guildId TEXT PRIMARY KEY FOREIGN KEY guilds(guildId)
    score INTEGER NOT NULL
    level INTEGER NOT NULL

TABLE commands
    name TEXT PRIMARY KEY
    guildId TEXT PRIMARY KEY FOREIGN KEY guilds(guildId)
    enabled INTEGER CHECK (enabled == 1 OR enabled == 0) NOT NULL
    restricted INTEGER NOT NULL CHECK(enabled == 1 OR enabled == 0)
    roles TEXT
    users TEXT
*/