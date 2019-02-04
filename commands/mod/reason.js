const Case = require('../../models/Case');
const {
  MessageEmbed
} = require('discord.js');
module.exports = new function () {
  this.name = 'reason';
  this.aliases = ['setreason'];
  this.description = 'Set the reason for a server\'s case';
  this.permission = 'MANAGE_MESSAGES';
  this.usage = '`n.reason <case #> <...reason>`';
  this.execute = async (client, message, args) => {
    if (!args[0] || !args[1]) return await message.channel.send(`Error: Incorrect usage. ${this.usage}`);
    const cachedCase = await client.redis.get(`case${args[0]}-${message.guild.id}`);
    const parsedCase = JSON.parse(cachedCase)
    if (!cachedCase || !parsedCase) return await message.channel.send(`Error: Invalid case number.`);
    if (cachedCase && parsedCase.staff !== message.author.id && parsedCase.locked === true) return await message.channel.send(`Error: This is not your case. Wait for it to be unlocked before modifying another staff member's case.`);
    const doc = await Case.findOneAndUpdate({
      guild: message.guild.id,
      case: parsedCase.case
    }, {
      $set: {
        reason: args.splice(1).join(' ')
      }
    }, {
      new: true
    });
    const msg = await message.channel.send(`Editing case number \`${doc.case}\`...`);
    await client.redis.set(`case${doc.case}-${message.guild.id}`, JSON.stringify(doc));
    const m = await client.channels.get(doc.channel).messages.fetch(doc.message);
    const staff = await client.users.fetch(doc.staff),
      user = await client.users.fetch(doc.user);
    let color = '';

    if (doc.type === 'Warn') color = '#ffd000';
    if (doc.type === 'Kick') color = '#fbff00';
    if (doc.type === 'Ban') color = '#ff0000';
    if (doc.type === 'Softban') color = '#ff7d00';
    if (doc.type === 'Mute') color = '#ffd000';
    const embed = new MessageEmbed()
      .setAuthor(doc.type, staff.displayAvatarURL())
      .setDescription(`\`Case #${doc.case}\``)
      .addField(`User`, `\`${user.tag} (${doc.user})\``, true)
      .addField(`Staff`, `\`${staff.tag} (${doc.staff})\``, true)
      .addField(`Reason`, `${doc.reason || 'No reason specified. Add one using `n.reason ' + doc.case + ' <...reason>`'}`, false)
      .setColor(color)
      .setTimestamp();
    try {
      await m.edit(embed);
    } catch (e) {
      return await message.channel.send('Error: Edited the case, but there is no saved log message.');
    }
    await msg.edit(`Edited case number \`${doc.case}\``);
  }
}