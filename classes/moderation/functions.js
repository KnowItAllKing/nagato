const Guild = require('../../models/Guild');
const ms = require('ms');
async function warn(message, member, reason) {
  const user = member.user;
  if (user.id === message.author.id) return await message.channel.send(`I doubt you want to warn yourself.`);
  if (user.id === message.guild.me.id) return await message.channel.send(`You can't warn me.`);
  const m = await message.channel.send(`Warning ${user.tag}...`);
  const doc = await message.client.case.create({
    type: 'Warn',
    guild: message.guild.id,
    staff: message.author.id,
    reason: reason,
    user: user.id
  });
  await m.edit(`Warned ${user.tag}`);
  await message.client.case.unlock({
    guild: doc.guild,
    staff: doc.staff,
    user: doc.user,
    case: doc.case,
    message: doc.message,
    channel: doc.channel
  })
  return doc;
}
module.exports.warn = warn;
async function mute(message, member, duration, reason) {
  if (!ms(duration)) {
    reason = duration;
    duration = '7d';
  }
  const user = member.user;
  if (user.id === message.author.id) return await message.channel.send(`You really don't want to mute yourself, do you?`);
  if (user.id === message.guild.me.id) return await message.channel.send(`I don't want to be muted :/`);
  const m = await message.channel.send(`Muting ${user.tag}...`);
  try {
    var doc = await message.client.case.create({
      type: 'Mute',
      guild: message.guild.id,
      staff: message.author.id,
      reason: reason,
      user: user.id
    });
  } catch (e) {}
  var muterole = message.guild.roles.get(await message.client.redis.get(`mute-${message.guild.id}`)) || await Guild.findOne({
    id: message.guild.id
  }).mute;
  if (!muterole) {
    const docu = await Guild.findOne({
      id: message.guild.id
    });
    var newmuterole = message.guild.roles.get(docu.mute);
    if (!newmuterole || !docu.mute) {
      try {
        newnewmuterole = await message.guild.roles.create({
          data: {
            name: 'Muted'
          }
        });
      } catch (e) {
        return await m.edit('Error: I could not create a muted role.');
      }
      message.guild.channels.forEach(async channel => {
        try {
          await channel.overwritePermissions({
            permissionOverwrites: [{
              id: newnewmuterole.id,
              deny: ['SEND_MESSAGES',
                'ADD_REACTIONS',
                'CONNECT',
                'SPEAK'
              ]
            }]
          });
        } catch (e) {
          return await m.edit(`Error: I could not create a Muted role.`);
        }
      })
      await message.client.redis.set(`mute-${message.guild.id}`, newnewmuterole.id);
      await Guild.findOneAndUpdate({
        id: message.guild.id
      }, {
        $set: {
          mute: newnewmuterole.id
        }
      });
    }
  }
  try {
    const newnewnewrole = muterole ? muterole : newnewmuterole;
    await member.roles.add(newnewnewrole);
    await m.edit(`Muted ${user.tag}`);
    setTimeout(async () => {
      try {
        await member.roles.remove(newnewnewrole);
      } finally {
        try {
          await message.client.case.unlock({
            guild: doc.guild,
            staff: doc.staff,
            user: doc.user,
            case: doc.case,
            message: doc.message,
            channel: doc.channel
          });
        } catch (e) {
          console.log(e)
        }
      }
    }, ms(duration));
  } catch (e) {
    console.log(e)
    return await m.edit(`Error: I could not mute that person.`);
  }
}
module.exports.mute = mute;
async function setLog(guild, channel) {
  const doc = await Guild.findOneAndUpdate({
    id: guild.id
  }, {
    $set: {
      log: channel.id
    }
  });
  return doc;
}
module.exports.setLog = setLog;