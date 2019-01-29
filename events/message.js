const {
  MessageEmbed
} = require('discord.js');
const Guild = require('../models/Guild');
module.exports = async (client, redis, message) => {
  if (message.author.bot) return;
  if (!message.guild) return;
  const prefix = await redis.get(`${message.guild.id}`);
  if (!prefix) {
    const doc = await Guild.findOne({
      id: message.guild.id
    });
    prefix = doc.prefix;
    await redis.set(`${message.guild.id}`, doc.prefix, redis.print);
  }
  if (!message.content.trim().startsWith(prefix)) return;
  const args = message.content.trim().slice(prefix.length).split(/\s+/g);
  const command = args.shift().toLowerCase();
  if (!client.commands.get(command)) return;
  try {
    return client.commands.get(command).execute(client, message, args);
  } catch (e) {
    await message.channel.send('An error has occurred. Please notify the support staff of this along with the time this has occurred.');
    return client.channels.get(process.env.ERROR).send(new MessageEmbed().setAuthor('Error', ))
  }
}