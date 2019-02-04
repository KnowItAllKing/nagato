module.exports = new function () {
  this.name = 'softban';
  this.aliases = ['sb', 'soft'];
  this.description = 'Softban a member - bans and unbans immediately after to clear recent messages';
  this.permission = 'BAN_MEMBERS';
  this.usage = '`n.softban <user> <...reason>`';
  this.execute = async (client, message, args) => {
    const member = !isNaN(args[0]) && args[0].length < 19 && args[0].length > 15 ? message.guild.member(await client.users.fetch(args[0])) : message.mentions.members.first(),
      reason = args.splice(1).join(' ');
    if (args.length < 1 || !member) return await message.channel.send(`Error: Incorrect usage. ${this.usage}`);
    return await client.softban(message, member, reason);
  }
}