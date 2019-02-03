const {
  MessageEmbed
} = require('discord.js');
const Guild = require('../models/Guild');
module.exports = async (client, guild) => {
  const tosave = new Guild({
    id: guild.id,
    prefix: 'n.'
  });
  await tosave.save();
  const channel = guild.channels.find(ch =>
    ch.type === 'text' &&
    ch.permissionsFor(guild.me).has('SEND_MESSAGES') &&
    !ch.name.includes('general') &&
    !ch.name.includes('main') &&
    !ch.name.includes('global'))
  const embed = new MessageEmbed()
    .setAuthor('Nagato: ' + guild.name, guild.iconURL)
    .setDescription('Hello! Thanks for adding me. I\'m a Discord bot created to make your server a better place. My abilities are restricted to moderation, but will be expanded soon.')
    .addField('My prefix: ', `\`${tosave.prefix}\``, true)
    .addField('Support server: ', '[Join](https://discord.gg/bc8hnAD)', true)
    .addField('Help Command ', 'Use `n.help` to list the commands.')
    .setColor(process.env.COLOR);
  if (!channel) {
    try {
      return await guild.owner.send(embed);
    } catch (e) {
      return;
    }
  } else {
    await channel.send(embed);
  }
}