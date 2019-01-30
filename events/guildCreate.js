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
    ch.type === 'text' &
    ch.permissionsFor(guild.me).has('SEND_MESSAGES') &&
    !ch.name.includes('general') &&
    !ch.name.includes('main'))
  const embed = new MessageEmbed()
    .setAuthor('Nagato: ' + guild.name, guild.iconURL)
    .setDescription('Hello! Thanks for adding me. I\'m an Discord bot created to make your server a better place. My abilities range from moderation to music.')
    .addField('Your prefix: ', `\`${tosave.prefix}\``, true)
    .addField('Support server: ', '[Join](https://discord.gg/bc8hnAD)', true);
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