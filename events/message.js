const {
  MessageEmbed
} = require('discord.js');
const Guild = require('../models/Guild');
module.exports = async (client, message) => {
  if (message.author.bot) return;
  if (!message.guild) return;
  if (!message.guild.me.hasPermission('SEND_MESSAGES')) return;
  const prefix = await client.redis.get(`prefix-${message.guild.id}`);
  if (!prefix) {
    const doc = await client.guild.model.findOne({
      id: message.guild.id
    });
    prefix = doc.prefix;
    await client.redis.set(`prefix-${message.guild.id}`, prefix);
  }
  if (!message.content.trim().startsWith(prefix)) return;
  const args = message.content.trim().slice(prefix.length).split(/\s+/g);
  const command = args.shift().toLowerCase(),
    cmd = client.commands.get(command);
  if (!cmd) return;
  if (!message.member.hasPermission(cmd.permission)) return await message.channel.send('You must have the `' + cmd.permission + '` permission to use this command.');
  try {
    return await cmd.execute(client, message, args);
  } catch (e) {
    console.log(e);
    return await message.channel.send('An error has occurred.');
    // return await client.channels.get(process.env.ERROR).send(new MessageEmbed().setAuthor('Command Error', message.guild.iconURL).addField('Guild: ', message.guild.id));
  }
}