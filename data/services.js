const Discord = require('discord.js');
const sql = require('sqlite');
const config = require('../config.json');

module.exports = {

    //#region Guild
    getGuild: async function (guild) {
        var row = await sql.get(`SELECT * FROM guilds WHERE guildId = ${guild.id}`).catch(console.error);
        if (!row) {
            await this.addGuild(guild).catch(() => {
                console.error;
                return;
            });
            row = this.getGuild(guild);
        }
        return row;
    },

    addGuild: async function (guild, prefix, lang, welMsg, byeMsg) {
        if (prefix === undefined) prefix = config.prefix;
        if (lang === undefined) lang = config.lang;
        if (welMsg === undefined) welMsg = config.welMsg;
        if (byeMsg === undefined) byeMsg = config.byeMsg;
        await sql.run("CREATE TABLE IF NOT EXISTS guilds (guildId VARCHAR(18), prefix VARCHAR(10) NOT NULL, lang VARCHAR(20) NOT NULL, welMsg VARCHAR(120) NOT NULL, byeMsg VARCHAR(120) NOT NULL, mod_wmsg INTEGER NOT NULL CHECK (mod_wmsg == 1 OR mod_wmsg == 0) DEFAULT 1, mod_bmsg INTEGER NOT NULL CHECK (mod_bmsg == 1 OR mod_bmsg == 0) DEFAULT 1, mod_level INTEGER NOT NULL CHECK (mod_level == 1 OR mod_level == 0) DEFAULT 1, PRIMARY KEY (guildId))");
        await sql.run(`INSERT INTO guilds (guildId, prefix, lang, welMsg, byeMsg) VALUES (?, ?, ?, ?, ?)`, [guild.id, prefix, lang, welMsg, byeMsg]);
        var members = guild.members.array();
        for (var m of members) {
            if (!m.user.bot) this.addUser(m.user, guild);
        }
    },

    delGuild: function (guild) {
        sql.run(`DELETE FROM guilds WHERE guildId = ${guild.id}`).catch(console.error);
    },

    updateGuild: function (row) {
        sql.run(`UPDATE guilds SET prefix = "${row.prefix}", lang = "${row.lang}", welMsg = "${row.welMsg}", byeMsg = "${row.byeMsg}", mod_wmsg = "${row.mod_wmsg}", mod_level = "${row.mod_level}" WHERE guildId = ${row.guildId}`);
    },
    //#endregion

    //#region User
    getUser: async function (user, guild) {
        var row = await sql.get(`SELECT * FROM users WHERE userId = ${user.id} AND guildId = ${guild.id}`).catch(console.error);
        if (!row) {
            await this.addUser(user, guild).catch(() => {
                console.error;
                return;
            });
            row = this.getUser(user, guild);
        }
        return row;
    },

    addUser: function (user, guild) {
        if (guild === undefined) guild = "DM";
        var today = new Date();
        var dd = today.getDate(),
            mm = today.getMonth() + 1,
            yyyy = today.getFullYear(),
            hh = today.getHours(),
            mi = today.getMinutes(),
            ss = today.getSeconds();
        today = yyyy + '-' + mm + '-' + dd + ' ' + hh + ':' + mi + ':' + ss;
        sql.run("CREATE TABLE IF NOT EXISTS users (userId VARCHAR(18), guildId VARCHAR(18), score INTEGER NOT NULL DEFAULT 0, level INTEGER NOT NULL DEFAULT 1, num_msg INTEGER NOT NULL DEFAULT 0, join_date DATETIME NOT NULL, PRIMARY KEY (userId, guildId), FOREIGN KEY (guildId) REFERENCES guilds(guildId) ON DELETE CASCADE)")
            .then(() => {
                sql.run(`INSERT INTO users (userId, guildId, join_date) VALUES (?, ?, ?)`, [user.id, guild.id, today]);
            }).catch(console.error);
    },

    delUser: function (user, guild) {
        if (guild === undefined) {
            //Deletes all instances of the user in the DB for all the servers
            sql.run(`DELETE FROM users WHERE userId = ${user.id}`).catch(console.error);
        } else {
            sql.run(`DELETE FROM users WHERE userId = ${user.id} AND guildId = ${guild.id}`).catch(console.error);
        }
    },

    updateUser: function (row) {
        sql.run(`UPDATE users SET score = "${row.score}", level = "${row.level}", num_msg = "${row.num_msg}" WHERE guildId = ${row.guildId} AND userId = ${row.userId}`);
    },
    //#endregion

    //#region Command
    addCommand: async function (name, guild) {
        var commandFile = require(`../commands/${name}.js`);
        var restricted = 0;
        var users = [];
        switch (commandFile.config.permLevel) {
            case "GuildOwner":
                restricted = 1;
                break;
            case "BotOwner":
                return;
        }
        await sql.run("CREATE TABLE IF NOT EXISTS commands (name VARCHAR(30), guildId VARCHAR(18), enabled INTEGER NOT NULL CHECK(enabled == 1 OR enabled == 0), restricted INTEGER NOT NULL CHECK(restricted == 1 OR restricted == 0), roles TEXT NOT NULL, users TEXT NOT NULL, PRIMARY KEY (name, guildId), FOREIGN KEY (guildId) REFERENCES guilds(guildId))").catch(console.error);
        await sql.run(`INSERT INTO commands (name, guildId, enabled, restricted, roles, users) VALUES (?, ?, ?, ?, ?, ?)`, [name, guild.id, 1, restricted, "", users.toString()]).catch(console.error);
    },

    getCommand: async function (name, guild) {
        var row = await sql.get(`SELECT * FROM commands WHERE name = "${name}" AND guildId = ${guild.id}`).catch(console.error);
        if (!row) {
            await this.addCommand(name, guild).catch(console.error);
            row = await sql.get(`SELECT * FROM commands WHERE name = "${name}" AND guildId = ${guild.id}`).catch(console.error);
        }
        return row;
    },

    delCommand: function (name, guild) {
        if (guild === undefined) {
            sql.run(`DELETE FROM commands WHERE name = "${name}"`).catch(console.error);
        } else {
            sql.run(`DELETE FROM commands WHERE name = "${name}" AND guildId = ${guild.id}`).catch(console.error);
        }
    },

    updateCommand: function (row) {
        sql.run(`UPDATE commands SET enabled = "${row.enabled}", restricted = "${row.restricted}", roles = "${row.roles}", users = "${row.users}" WHERE name = "${row.name}" AND guildId = ${row.guildId}`).catch(console.error);
    },
    //#endregion

    //#region Level Rewards
    getReward: async function (level, guild, createOnFail) {
        var createOnFail = createOnFail == undefined ? true : false;
        var row = await sql.get(`SELECT * FROM level_rewards WHERE level = ${level} AND guildId = ${guild.id}`).catch(console.error);
        if (!row && createOnFail) {
            await this.addReward(level, guild);
            row = await this.getReward(level, guild, false);
        }
        return row;
    },

    addReward: async function (level, guild, roles) {
        if (roles === undefined) roles = "";
        await sql.run("CREATE TABLE IF NOT EXISTS level_rewards (level INTEGER NOT NULL, guildId VARCHAR(18), roles TEXT NOT NULL, PRIMARY KEY (level, guildId), FOREIGN KEY (guildId) REFERENCES guilds (guildId) ON DELETE CASCADE)");
        await sql.run(`INSERT INTO level_rewards (level, guildId, roles) VALUES (?, ?, ?)`, [level, guild.id, roles]).catch(console.error);
    },
    delReward: function (level, guild) {
        sql.run(`DELETE FROM level_rewards WHERE level = ${level} AND guildId = ${guild.id}`).catch(console.error);
    },

    updateReward: function (row) {
        sql.run(`UPDATE level_rewards SET roles = "${row.roles}" WHERE level = ${row.level} AND guildId = ${row.guildId}`).catch(console.error);
    },
    //#endregion
    getDefChannel: (guild, member) => {
        // get "original" default channel
        var user = member === undefined ? guild.client.user : member;
        if (guild.channels.has(guild.id))
            return guild.channels.get(guild.id)
        var defChan = guild.channels
            .filter(c => c.type === "text" &&
                c.permissionsFor(user).has("SEND_MESSAGES"))
            .sort((a, b) => a.position - b.position ||
                Long.fromString(a.id).sub(Long.fromString(b.id)).toNumber())
            .first();
        if (guild.client.user !== user && defChan === undefined) {
            defChan = guild.channels
                .filter(c => c.type === "text" &&
                    c.permissionsFor(guild.client.user).has("SEND_MESSAGES"))
                .sort((a, b) => a.position - b.position ||
                    Long.fromString(a.id).sub(Long.fromString(b.id)).toNumber())
                .first();
        }
        return defChan;
    },

    updateUserStats: async function (message, guildConfig) {
        var row = await this.getUser(message.author, message.guild);
        row.num_msg++;
        if (++row.score >= (30 + 20 * row.level)) {
            var lang = require(`../strings/${guildConfig.lang}.json`);
            row.score = 0;
            row.level++;
            if (guildConfig.mod_level == 1) {
                var rewards = await this.getReward(row.level, message.guild, false);
                var member = message.member;
                var embed = new Discord.RichEmbed().setThumbnail(member.user.displayAvatarURL).addField(lang.level_up, lang.level_up_congrat.replace('$2', row.level).replace('$1', message.member)).setColor("#f24646");
                if (rewards) {
                    if (!message.guild.me.permissions.has("MANAGE_ROLES")) {
                        message.guild.owner.send(lang.level_no_manage_roles_perms.replace('$1', member.displayName).replace('$2', member.id).replace('$3', message.guild.name)); //Meh forma de comunicar el error provisional
                    } else {
                        var roles = message.guild.roles.filter((role) => {
                            return rewards.roles.split(',').indexOf(role.id) >= 0;
                        });
                        var rArray = roles.array();
                        var mRoles = member.roles.array();
                        for (var i = 0; i < mRoles.length; i++) {
                            if (rArray.indexOf(mRoles[i]) >= 0) {
                                rArray.splice(rArray.indexOf(mRoles[i]), 1);
                            }
                        }
                        member.addRoles(rArray, lang.level_reason);
                        if (rArray.length > 0) {
                            var s = "";
                            for (var i = 0; i < rArray.length; i++) {
                                s += "- " + rArray[i].name + "\n";
                            }
                            embed.addField(lang.level_up_new_roles, s);
                        }
                    }
                }
                message.channel.send(embed); //The final message will be an embed and will notice the awarded roles
            }
        }
        this.updateUser(row);
    }
}