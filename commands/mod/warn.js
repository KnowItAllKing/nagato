module.exports = new function () {
  this.name = 'warn';
  this.aliases = [];
  this.description = 'Warn';
  this.permission = 'MANAGE_MESSAGES';
  this.usage = 'n.warn <user> <...reason>';
  this.execute = async (client, message, args) => {
    if (args.length < 2) return await message.channel.send(`Error: Incorrect usage. \`${this.usage}\``);
    try {
      const member = !isNaN(args[0]) && args[0].length < 19 && args[0].length > 15 ? message.guild.member(await client.users.fetch(args[0])) : message.mentions.members.first();
      if (!member) return await message.channel.send('Error: Incorrect usage. ' + this.usage);
      return await client.warn(message, member, args.splice(1).join(' '));
    } catch (e) {
      return console.error(e);
    }
  }
}