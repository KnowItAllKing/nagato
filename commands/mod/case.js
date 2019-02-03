const {
  MessageEmbed
} = require('discord.js');
module.exports = new function () {
  this.name = 'case';
  this.aliases = ['c'];
  this.description = 'Case';
  this.permission = 'MANAGE_MESSAGES';
  this.usage = '`n.case <case #>`';
  this.execute = async (client, message, args) => {
    if (!args[0] || isNaN(args[0])) return await message.channel.send(`Error: Incorrect usage. ${this.usage}`);
    const theCase = await client.case.fetch({
      case: Number(args[0]),
      guild: message.guild.id
    });
    if (!theCase) return await message.channel.send(`Error: Unknown case.`);
    const user = await client.users.fetch(theCase.user),
      staff = await client.users.fetch(theCase.staff);
    const embed = new MessageEmbed()
      .setAuthor(`Case #${theCase.case}`, message.author.displayAvatarURL())
      .addField('Type', theCase.type, true)
      .addField('User', user.tag, true)
      .addField('Staff', staff.tag, true)
      .addField('Reason', theCase.reason, true)
      .addField('Status', `${theCase.locked ? 'Locked' : 'Unlocked'}`)
      .setColor(process.env.COLOR);
    return await message.channel.send(embed);
  }
}