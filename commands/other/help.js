const {
  MessageEmbed
} = require('discord.js');
module.exports = new function () {
  this.name = 'help'
  this.aliases = ['commands'];
  this.description = 'List out all of the bot\'s commands';
  this.permission = 'SEND_MESSAGES';
  this.usage = '`n.help <?category>`';
  this.execute = async (client, message, args) => {
    if (args[0] && client.commands.get(args[0].toLowerCase())) {
      const {
        name,
        aliases,
        description,
        permission,
        usage
      } = client.commands.get(args[0].toLowerCase())
      var aliasStr = '';
      for (var i = 0; i < aliases.length; i++) aliasStr += `\`${aliases[i]}\`${i !== aliases.length- 1 ? ',' : ''} `;

      const embed = new MessageEmbed()
        .setAuthor(`Command: ${name}`, message.author.displayAvatarURL())
        .addField(`Description`, description, true)
        .addField(`Aliases`, aliasStr, true)
        .addField(`Permission`, `\`${permission}\``, true)
        .addField(`Usage`, usage, true)
        .setColor(process.env.COLOR);
      return await message.channel.send(embed);
    }
    const modcmds = [],
      other = [],
      user = [],
      music = [],
      admin = [];
    var modStr = '',
      otherStr = '',
      userStr = '',
      musicStr = '',
      adminStr = '';
    client.commands.forEach(command => {
      if (!modcmds.includes(command.name) && command.category === 'mod') return modcmds.push(command.name);
      if (!other.includes(command.name) && command.category === 'other') return other.push(command.name);
      if (!user.includes(command.name) && command.category === 'user') return user.push(command.name);
      if (!music.includes(command.name) && command.category === 'music') return music.push(command.name);
      if (!admin.includes(command.name) && command.category === 'admin') return admin.push(command.name);
    });
    for (let p = 0; p < modcmds.length; p++) modStr += `\`${modcmds[p]}\`${p !== modcmds.length- 1 ? ',' : ''} `;
    for (let p = 0; p < other.length; p++) otherStr += `\`${other[p]}\`${p !== other.length- 1 ? ',' : ''} `;
    for (let p = 0; p < user.length; p++) userStr += `\`${user[p]}\`${p !== user.length- 1 ? ',' : ''} `;
    for (let p = 0; p < music.length; p++) musicStr += `\`${music[p]}\`${p !== music.length- 1 ? ',' : ''} `;
    for (let p = 0; p < admin.length; p++) adminStr += `\`${admin[p]}\`${p !== admin.length- 1 ? ',' : ''} `;
    const embed = new MessageEmbed()
      .setAuthor(`Help`, client.user.displayAvatarURL())
      .addField(`**Admin**`, adminStr, false)
      .addField(`**Mod**`, modStr, false)
      .addField(`**Music**`, musicStr, false)
      .addField(`**User**`, userStr, false)
      .addField(`**Other**`, otherStr, false)
      .setColor(process.env.COLOR);

    // for (const cmd of modcmds) embed.addField(cmd.name, cmd.description, true);
    // if (admin.length > 0) embed.addField(`**Admin**`, '_ _');
    // for (const cmd of admin) embed.addField(cmd.name, cmd.description, true);
    // if (other.length > 0) embed.addField(`**Misc**`, '_ _');
    // for (const cmd of other) embed.addField(cmd.name, cmd.description, true);
    // if (user.length > 0) embed.addField(`**User**`, '_ _');
    // for (const cmd of user) embed.addField(cmd.name, cmd.description, true);
    // if (music.length > 0) embed.addField(`**Music**`, '_ _');
    // for (const cmd of music) embed.addField(cmd.name, cmd.description, true);


    return await message.channel.send(embed);

  }
}