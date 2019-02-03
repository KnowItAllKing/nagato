const {
  MessageEmbed
} = require('discord.js');
module.exports = new function () {
  this.name = 'history';
  this.aliases = ['h', 'violations'];
  this.description = 'Check history';
  this.permission = 'SEND_MESSAGES';
  this.usage = '`n.history <?user>`';
  this.execute = async (client, message, args) => {
    if (message.member.hasPermission('MANAGE_MESSAGES') && args[0]) {
      const user = !isNaN(args[0]) && args[0].length < 19 && args[0].length > 15 ? await client.users.fetch(args[0]) : message.mentions.users.first();
      if (!user) {
        const {
          color,
          warnings,
          mutes,
          kicks,
          bans
        } = await client.case.checkHistory({
          guild: message.guild.id,
          user: message.author.id
        });
        const embed = new MessageEmbed()
          .setAuthor(message.author.tag, message.author.displayAvatarURL())
          .setDescription(`${warnings} ${warnings === 0 ||warnings > 1 ? 'warnings' : 'warning'}, ${mutes} ${mutes === 0 ||mutes > 1 ? 'mutes' : 'mute'}, ${kicks} ${kicks === 0 ||kciks > 1 ? 'kicks' : 'kick'}, ${bans} ${bans === 0 ||bans > 1 ? 'bans' : 'ban'}`)
          .setColor(color);
        return await message.channel.send(embed);
      }
      const r = new RegExp(/clear/, 'i');
      if (message.member.hasPermission('ADMINISTRATOR') && r.test(args[1])) {
        const prompt = await client.prompt(message, `Are you sure you want to clear ${user.tag}'s history? This is irreversible. Respond with **Y**es or **N**o within 30 seconds.`);
        if (prompt === 'Failure') return await message.channel.send(`Operation canceled.`);
        if (prompt === 'Timeout') return await message.channel.send(`Error: Didn't receive a confirmation. Operation canceled.`);
        if (prompt !== 'Success') return await message.channel.send(`An error occurred.`);
        const m = await message.channel.send(`Clearing ${user.tag}'s history...`)
        const docs = await client.case.model.find({
          guild: message.guild.id,
          user: user.id
        });

        for (const doc of docs) {
          await client.case.model.findOneAndUpdate({
            guild: doc.guild,
            user: doc.user,
            case: doc.case
          }, {
            $set: {
              type: ''
            }
          });
        }
        return await m.edit(`Cleared ${user.tag}'s history`);
      }
      const {
        color,
        warnings,
        mutes,
        kicks,
        bans
      } = await client.case.checkHistory({
        guild: message.guild.id,
        user: user.id
      });
      const embed = new MessageEmbed()
        .setAuthor(user.tag, user.displayAvatarURL())
        .setDescription(`${warnings} ${warnings === 0 ||warnings > 1 ? 'warnings' : 'warning'}, ${mutes} ${mutes === 0 ||mutes > 1 ? 'mutes' : 'mute'}, ${kicks} ${kicks === 0 ||kicks > 1 ? 'kicks' : 'kick'}, ${bans} ${bans === 0 ||bans > 1 ? 'bans' : 'ban'}`)
        .setColor(color);
      return await message.channel.send(embed);
    }
    const {
      color,
      warnings,
      mutes,
      kicks,
      bans
    } = await client.case.checkHistory({
      guild: message.guild.id,
      user: message.author.id
    });
    const embed = new MessageEmbed()
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setDescription(`${warnings} ${warnings === 0 ||warnings > 1 ? 'warnings' : 'warning'}, ${mutes} ${mutes === 0 ||mutes > 1 ? 'mutes' : 'mute'}, ${kicks} ${kicks === 0 ||kciks > 1 ? 'kicks' : 'kick'}, ${bans} ${bans === 0 ||bans > 1 ? 'bans' : 'ban'}`)
      .setColor(color);
    return await message.channel.send(embed);

  }

}