const ms = require('ms');
module.exports = new function () {
  this.name = 'mute';
  this.aliases = ['m'];
  this.description = 'Mute a member for a specified duration for an optional specified reason';
  this.permission = 'MANAGE_MESSAGES';
  this.usage = '`n.mute <user> <duration> <...reason>`\nExamples for duration: `30m` is 30 minutes, `12` is 12 hours, and `7d` is 7 days.';
  this.execute = async (client, message, args) => {
    const member = !isNaN(args[0]) && args[0].length < 19 && args[0].length > 15 ? message.guild.member(await client.users.fetch(args[0])) : message.mentions.members.first();
    if (args.length < 1 || !member) return await message.channel.send(`Error: Incorrect usage. ${this.usage}`);
    var duration = args[1] ? args[1] : '7d';
    if (ms(duration) < 60000) return await message.channel.send(`Error: Minimum duration is one minute.`);
    var reason = args[2] ? args.splice(2).join(' ') : null;
    if (reason) return await client.mute(message, member, duration, reason);
    else return await client.mute(message, member, duration);
  };
}