const {
  MessageEmbed
} = require('discord.js');
module.exports = new function () {
  this.name = 'help'
  this.aliases = ['commands'];
  this.description = 'Help';
  this.permission = 'SEND_MESSAGES';
  this.usage = '`n.help <?category>`';
  this.execute = async (client, message, args) => {
    const modcmds = [],
      misc = [],
      user = [];
    client.commands.forEach(command => {
      const cd = {
        name: command.name,
        aliases: command.aliases,
        description: command.description,
        permission: command.permission,
        usage: command.usage
      }
      if (command.category === 'mod' && modcmds.length === 0) return modcmds.push(cd);
      if (!modcmds.some(i => i.name === command.name) && command.category === 'mod') return modcmds.push(cd);
      if (command.category === 'misc' && misc.length === 0) return misc.push(cd);
      if (!misc.some(i => i.name === command.name) && command.category === 'misc') return misc.push(cd);
      if (command.category === 'user' && user.length === 0) return user.push(cd);
      if (!user.some(i => i.name === command.name) && command.category === 'user') return user.push(cd);
    });

    const embed = new MessageEmbed()
      .setAuthor(`Help`, client.user.displayAvatarURL())
      .addField(`**Mod**`, '_ _')
      .setColor(process.env.COLOR);
    for (const cmd of modcmds) {
      embed.addField(cmd.name, `${cmd.description}\n${cmd.usage}`);
    }
    embed.addField(`**Misc**`, '_ _');
    for (const cmd of misc) {
      embed.addField(cmd.name, `${cmd.description}\n${cmd.usage}`);
    }
    embed.addField(`**User**`, '_ _');
    for (const cmd of user) {
      embed.addField(cmd.name, `${cmd.description}\n${cmd.usage}`);
    }
    return await message.channel.send(embed);

  }
}