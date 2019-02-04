module.exports = new function () {
  this.name = 'kick';
  this.aliases = ['k'];
  this.description = 'Kick a member for an optional specified reason';
  this.permission = 'KICK_MEMBERS';
  this.usage = '`n.kick <user> <...reason>`';
  this.execute = async (client, message, args) => {
    const member = !isNaN(args[0]) && args[0].length < 19 && args[0].length > 15 ? message.guild.member(await client.users.fetch(args[0])) : message.mentions.members.first(),
      reason = args.splice(1).join(' ');
    if (args.length < 1 || !member) return await message.channel.send(`Error: Incorrect usage. ${this.usage}`);
    return await client.kick(message, member, reason);
  }
}