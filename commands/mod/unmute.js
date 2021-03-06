module.exports = new function () {
  this.name = 'unmute';
  this.aliases = ['um', 'unm'];
  this.description = 'Unmute a member for a reason';
  this.permission = 'MANAGE_MESSAGES';
  this.usage = '`n.unmute <user> <...reason>`';
  this.execute = async (client, message, args) => {
    const member = !isNaN(args[0]) && args[0].length < 19 && args[0].length > 15 ? message.guild.member(await client.users.fetch(args[0])) : message.mentions.members.first(),
      reason = args.splice(1).join(' ');
    if (args.length < 1 || !member) return await message.channel.send(`Error: Incorrect usage. ${this.usage}`);
    return await client.unmute(message, member, reason);
  }
}