//Songs Properties
//  info: information abour the video
//  requester: user that requested the song

//Context content
//  status: {'playing', 'paused', 'stopped'}
//  queue: array of songs queued
//  dispatcher: dispatcher asociated to the guild
//  playing: info of the song playing
//  timeout: timeout to leave voice channel when no music is playing

const Discord = require('discord.js');
const yt = require('ytdl-core');
let context = {};
const config = require('../config.json');
const promisify = require('util').promisify;
var search = require('youtube-search');
const searchAsync = promisify(search);
const stringSimilarity = require('string-similarity');

var opts = {
    maxResults: 10,
    key: config.YouTubeAPI_key
};

exports.run = async (client, message, args, guildConfig) => {
    const lang = require(`../strings/${guildConfig.lang}.json`);
    let guildId = message.guild.id;
    if (!args[0]) {
        args[0] = "nani";
    }
    switch (args[0].toLowerCase()) {
        case 'play':
            {
                initContext(guildId);
                if (!args[1]) {
                    if (context[guildId].status === 'playing') message.channel.send(lang.music_already_playing);
                    if (context[guildId].status === 'paused') {
                        context[guildId].dispatcher.resume();
                        message.react('▶');
                        context[guildId].status = 'playing';
                    }
                    if (context[guildId].status === 'stopped') message.channel.send(lang.music_no_songs);
                    return;
                }
                let url = args[1];
                if (!url.startsWith('https://youtube')) {
                    results = await searchAsync(args.slice(1).join(' '), opts);
                    if(!results) return console.log('No videos found!');
                    results = results.filter(video => video.kind === "youtube#video");
                    url = results[0].link;
                }
                let info = await yt.getInfo(url);
                if (!info) return message.channel.send(lang.music_invalid_url);
                let song = {'info': info,'requester': message.member};
                if (context[guildId].status === 'stopped') {
                    play(message, song, lang);
                } else {
                    let embed = new Discord.RichEmbed().setColor("#f24646").addField(lang.music_queued, "- [" + song.info.title + "](" + song.info.video_url + ") [" + song.requester + "]\n");
                    context[guildId].queue.push(song);
                    message.channel.send(embed);
                }
            }
            break;
        case 'pause':
            {
                if(initContext(guildId) || context[guildId].status !== 'playing') return;
                context[guildId].status = 'paused';
                context[guildId].dispatcher.pause();
                message.react('⏸');
                return;
            }
            break;
        case 'resume':
            {
                if(initContext(guildId) || context[guildId].status !== 'paused') return;
                context[guildId].status = 'playing';
                context[guildId].dispatcher.resume();
                message.react('▶');
                return;
            }
            break;
        case 'skip':
            {
                if(initContext(guildId) || context[guildId].status === 'stopped') return;
                context[guildId].status = 'playing';
                context[guildId].dispatcher.end();
                message.react('⏩');
                return;
            }
            break;
        case 'stop':
            {
                if (initContext(guildId) || context[guildId].status === 'stopped') return;
                context[guildId].queue = [];
                context[guildId].dispatcher.end();
                message.react('🛑');
                return;
            }
            break;
        case 'join':
            {
                if(!message.guild.me.permissions.has("CONNECT")) return message.reply(lang.music_no_connect_permission);
                if(!message.guild.me.permissions.has("SPEAK")) return message.reply(lang.music_no_speak_permission);
                if(message.member.voiceChannel === undefined) return message.reply(lang.music_not_in_voice_chat);
                initContext(guildId);
                message.member.voiceChannel.join();
                message.react('✅');
                if(context[guildId].status === 'stopped') {
                    context[guildId].timeout = setTimeout(() => {
                        if(!message.guild.voiceConnection) return;
                        message.guild.voiceConnection.disconnect();
                    }, 300000);
                }
                return;
            }
            break;
        case 'leave':
            {
                initContext(guildId);
                if(message.guild.voiceConnection === null) return;
                clearTimeout(context[guildId].timeout);
                context[guildId].queue = [];
                context[guildId].status = 'stopped';
                message.guild.voiceConnection.disconnect();
                message.react('✅');
                return;
            }
            break;
        case 'remove':
            {
                if(!args[1]) return message.channel.send(lang.missing_args + "\nm remove <title>");
                let title = args.slice(1).join(' ');
                let songs = context[guildId].queue.map(song => song.info.title);
                let bestMatch = stringSimilarity.findBestMatch(title, songs).bestMatch;
                if(bestMatch.rating <= 0) return message.channel.send(lang.music_no_matches);
                let deletedSong = context[guildId].queue.filter(song => song.info.title === bestMatch.target)[0];
                context[guildId].queue = context[guildId].queue.filter(song => song !== deletedSong);
                let embed = new Discord.RichEmbed().setColor("#f24646").addField(lang.music_removed_header, "- [" + deletedSong.info.title + "](" + deletedSong.info.video_url + ") [" + deletedSong.requester + "]\n");
                message.channel.send(embed);
                return;
            }
            break;
        case 'queue':
            {
                if(initContext(guildId) || context[guildId].status === 'stopped') return message.channel.send(lang.music_no_songs);
                let embed = new Discord.RichEmbed().setColor("#f24646");
                embed.addField(lang.music_playing_header, "- [" + context[guildId].playing.info.title + "](" + context[guildId].playing.info.video_url + ") [" + context[guildId].playing.requester + "]");
                let list = context[guildId].queue.reduce((old, actual, index, vector) => old + "["+ index + "] [" + actual.info.title + "](" + actual.info.video_url + ") [" + actual.requester + "]\n", "");
                if(list.length === 0) list = "*" + lang.music_no_songs + "*";
                embed.addField(lang.music_song_queue_header, list);
                message.channel.send(embed);
                return;
            }
            break;
        default:
            {
                let help = require('./help.js');
                help.run(client, message, ['music'], guildConfig);
                return;
            }
    }
}

exports.config = {
    enabled: 1,
    permLevel: "User"
}

exports.help = {
    name: "music",
    category: "Music",
    usage: "m play [url | song title]\nm remove <id | url | song title>\\nm pause\nm stop\nm skip\nm leave\nm join\nm queue"
}

function initContext(guildId) {
    if (context.hasOwnProperty(guildId)) return false;
    context[guildId] = {};
    context[guildId].status = 'stopped';
    context[guildId].queue = [];
    return true;
}

function play(message, song, lang) {
    if(!message.guild.me.permissions.has("CONNECT")) return message.reply(lang.music_no_connect_permission);
    if(!message.guild.me.permissions.has("SPEAK")) return message.reply(lang.music_no_speak_permission);
    if(message.member.voiceChannel === undefined) return message.reply(lang.music_not_in_voice_chat);
    let guildId = message.guild.id;
    clearTimeout(context[guildId].timeout);
    context[guildId].status = 'playing';
    if (message.guild.voiceConnection === null) message.member.voiceChannel.join();
    context[guildId].playing = song;
    let embed = new Discord.RichEmbed().setColor("#f24646").addField(lang.music_playing_header, "[" + song.info.title + "](" + song.info.video_url +") [" + song.requester + "]");
    message.channel.send(embed);
    context[guildId].dispatcher = message.guild.voiceConnection.playStream(yt(song.info.video_url, {audioonly: true}), { passes: 1});
    context[guildId].dispatcher.on('end', () => {
        let song = context[guildId].queue.shift();
        if(!song || song === undefined) {
            clearTimeout(context[guildId].timeout);
            context[guildId].status = 'stopped';
            context[guildId].timeout = setTimeout(() => {
                if(!message.guild.voiceConnection) return;
                message.guild.voiceConnection.disconnect();
            }, 300000);
            return;
        }
        play(message, song, lang);
    });
    context[guildId].dispatcher.on('error', (err) => {
        message.channel.send('ERROR: ' + err);
        let song = context[guildId].queue.shift();
        if(!song || song === undefined) {
            clearTimeout(context[guildId].timeout);
            context[guildId].playing = null;
            context[guildId].status = 'stopped';
            context[guildId].timeout = setTimeout(() => {
                if(!message.guild.voiceConnection) return;
                message.guild.voiceConnection.disconnect();
            }, 300000);
            return;
        }
        play(message, song, lang);
    });
}