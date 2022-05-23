const { Client, Intents } = require("discord.js");
const client = new Client(
    { 
        intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] 
    });
const config = require("./config.json");
const Player = require('discord-player-music');

client.player = new Player(client);

client.on('ready',() => {
    console.log(`Logged in as ${client.user.tag}!`);
})

client.on('messageCreate', async (message) => {
    const messageArray = message.content.split(' ');
    const command = messageArray[0];
    const args = messageArray.slice(1);
    console.log(command);
    console.log(args);

    if(command === '!join') {
        if(!message.member.voice.channel) return message.channel.send({ content: `${message.member}, join to the voice channel!`});
    
        client.player.voice.join(message.member).then(data => {
            return message.channel.send({ content: `${message.member}, bot joined the **${data.voiceChannel.name}** channel!`});
        }).catch(error => {
            return message.channel.send({ content: error.message});
        })
    }

    if(command === '!skip') {
        if(!message.member.voice.channel) return message.channel.send({ content: `${message.member}, join to the voice channel!`});
    
        client.player.skip(message.guild).then( () => {
            return message.channel.send({ content: `${message.member}, song successfully skiped!`});
        }).catch(error => {
            return message.channel.send({ content: error.message});
        })
    }

    if(command === '!stop') {
        if(!message.member.voice.channel) return message.channel.send({ content: `${message.member}, join to the voice channel!`});
    
        client.player.stop(message.guild).then(() => {
            return message.channel.send({ content: `${message.member}, playing server queue stopped!`});
        }).catch(error => {
            return message.channel.send({ content: error.message});
        })
    }

    if(command === '!leave') {
        if(!message.member.voice.channel) return message.channel.send({ content: `${message.member}, join to the voice channel!` });
    
        client.player.voice.leave(message.member).then(data => {
            return message.channel.send({ content: `${message.member}, bot left the voice channel **${data.voiceChannel.name}**`});
        }).catch(error => {
            return message.channel.send({ content: error.message });
        })
    }

    //TODO Describe what we playing
    if(command === '!play') {
        if(!message.member.voice.channel) return message.channel.send({ content: `${message.member}, join to the voice channel!`});
    
        const query = args.join(' ');
        if(!query) return message.channel.send({ content: `${message.member}, enter your search request!`});
    
        client.player.searchSong(message.member, query, message.channel).then(results => {
            client.player.addSong(1, message.member, results);
        }).catch(error => {
            return message.channel.send({ content: error.message});
        })
    }

    if(command === '!np') {
        const index = args.join(' ');
    
        client.player.getSongInfo(message.guild, index).then(async data => {
            const progress = await client.player.createProgressBar(message.guild);
    
            return message.channel.send({ content: `Song Title: **${data.song.title}**\nSong URL: **${data.song.url}**\nSong Duration: ${data.song.duration.hours}:${data.song.duration.minutes}:${data.song.duration.seconds}\n\n${progress.bar} **[${progress.percents}]**`});
        }).catch(error => {
            return message.channel.send({ content: error.message});
        })
    }

    //TODO Lyrics Genius API
    if(command === '!lyrics') {
        const query = args.join(' ');
    
        client.player.getLyrics(message.guild, query).then(data => {
            return message.channel.send({ content: `Song Title: **${typeof data.song != 'object' ? data.song : data.song.title}**\n\n${data.lyrics}`});
        }).catch(async error => {
            return message.channel.send({ content: error.message});
        })
    }
    if(command === '!pause') {
        const query = args.join(' ');
    
        client.player.pause(message.guild, query).then(data => {
            return message.channel.send({ content: `Song Title: **${data.song.title}** paused!`});
        }).catch(async error => {
            return message.channel.send({ content: error.message});
        })
    }
    if(command === '!resume') {
        const query = args.join(' ');
    
        client.player.resume(message.guild, query).then(data => {
            return message.channel.send({ content: `Song Title: **${data.song.title}** continued!`});
        }).catch(async error => {
            return message.channel.send({ content: error.message});
        })
    }
    if(command === '!queue') {
        client.player.getQueue(message.guild).then(songs => {
            return message.channel.send({ content: songs.map((song, index) => `\`[${index + 1}]\` - **${song.title}** [${song.duration.hours}:${song.duration.minutes}:${song.duration.seconds}]`).join('\n')});
        }).catch(error => {
            return message.channel.send({ content: error.message});
        })
    }
});

client.player.on('queueEnded', data => {
    return data.textChannel.send({ content: 'Server queue playing ended!' });
});

client.player.on('playerError', data => {
    if(!data.textChannel) return console.log(data.error);

    if(data.error.message.includes('Status code: 403')) return data.textChannel.send({ content: 'A playback error has occurred! Trying to run...' });
    if(data.error.message.includes('Status code: 404')) return data.textChannel.send({ content: 'An error has occurred in the YouTube API! Try again.' });
});


client.login(config.token);