module.exports = new function () {
  this.name = 'ban';
  this.aliases = ['b'];
  this.description = 'Ban a member for an optional specified reason';
  this.permission = 'BAN_MEMBERS';
  this.usage = '`n.ban <user> <...reason>`';
  this.execute = async (client, message, args) => {
    const member = !isNaN(args[0]) && args[0].length < 19 && args[0].length > 15 ? message.guild.member(await client.users.fetch(args[0])) : message.mentions.members.first(),
      reason = args.splice(1).join(' ');
    if (args.length < 1 || !member) return await message.channel.send(`Error: Incorrect usage. ${this.usage}`);
    return await client.ban(message, member, reason);
  }

}