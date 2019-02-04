const ytdl = require('ytdl-core');
const YouTube = require('youtube-node');
module.exports = new function () {
  this.name = 'play';
  this.aliases = ['p', 'music'];
  this.description = 'Play a song';
  this.permission = 'SEND_MESSAGES';
  this.usage = '`n.play <...song name>`';
  this.execute = async (client, message, args) => {
    if (!message.member.voiceChannel) return await message.channel.send('You must be in a voice channel to use this command.');
    // if (message.guild.me.voiceChannel) return await message.channel.send(`I'm already connected.`);
    if (!args[0]) return await message.channel.send(`Error: Incorrect usage. ${this.usage}`);
    const validate = await ytdl.validateURL(args[0]);
    if (!validate) {
      const youtube = new YouTube();
      youtube.setKey(process.env.YOUTUBE);
      youtube.search(args.join(' '), 1, async (error, result) => {
        if (error) return console.log(error);
        console.log(result);
        if (!result) return await message.channel.send(`Error: Invalid URL.`);
      });

    }
    const info = ytdl.getInfo

  }
}