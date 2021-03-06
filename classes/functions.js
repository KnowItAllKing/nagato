const Guild = require('../models/Guild');
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
      duration: duration,
      user: user.id
    });
  } catch (e) {
    return;
  }
  try {
    await message.client.case.newMute({
      guild: message.guild.id,
      staff: message.author.id,
      reason: reason,
      duration: ms(duration),
      user: user.id,
      case: doc.case
    });
  } catch (e) {
    return console.log(e);
  }
  var muterole = message.guild.roles.get(await message.client.redis.get(`mute-${message.guild.id}`)) || message.guild.roles.get(await Guild.findOne({
    id: message.guild.id
  }).mute);
  if (!muterole) {
    const docu = await Guild.findOne({
      id: message.guild.id
    });
    var newmuterole = message.guild.roles.get(docu.mute);
    if (!newmuterole || !docu.mute) {
      try {
        var newnewmuterole = await message.guild.roles.create({
          data: {
            name: 'Muted'
          }
        });
      } catch (e) {
        return await m.edit('Error: I could not create a muted role.');
      }
      message.guild.channels.forEach(async channel => {
        try {
          await channel.updateOverwrite(newnewmuterole, {
            SEND_MESSAGES: false,
            ADD_REACTIONS: false,
            CONNECT: false,
            SPEAK: false
          });
        } catch (e) {
          return await m.edit(`Error: I could not create a Muted role.`);
        }
      })
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
    const newnewnewrole = muterole || newmuterole || newnewmuterole;
    await member.roles.add(newnewnewrole);
    await message.client.redis.set(`mute-${message.guild.id}`, newnewnewrole.id);
    await m.edit(`Muted ${user.tag}`);
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
async function softban(message, member, reason) {
  const user = member.user;
  if (user.id === message.author.id) return await message.channel.send(`Who would save you if you banned yourself?`);
  if (user.id === message.guild.me.id) return await message.channel.send(`What have I done to you?`);
  if (!member.bannable || member.roles.highest.comparePositionTo(message.member.roles.highest) > 0) return await message.channel.send(`That person has god mode enabled. What a drag.`);
  const m = await message.client.prompt(message, 'Are you sure you want to softban this user? Respond with **Y**es or **N**o within 30 seconds.');
  if (m === 'Failure') return await message.channel.send(`Operation canceled.`);
  if (m === 'Timeout') return await message.channel.send(`Error: Didn't receive a confirmation. Operation canceled.`);
  if (m !== 'Success') return await message.channel.send(`An error occurred.`);
  const msg = await message.channel.send(`Softbanning ${user.tag}...`);
  await message.client.case.create({
    type: 'Softban',
    guild: message.guild.id,
    staff: message.author.id,
    reason: reason,
    user: user.id
  });
  await member.ban({
    days: 7,
    reason: `Softban by ${message.author.tag}: ${reason}`
  });
  await message.guild.members.unban(user, `Softban successful.`);
  return await msg.edit(`Softbanned ${user.tag}`);
}
module.exports.softban = softban;
async function ban(message, member, reason) {
  const user = member.user;
  if (user.id === message.author.id) return await message.channel.send(`Who would save you if you banned yourself?`);
  if (user.id === message.guild.me.id) return await message.channel.send(`What have I done to you?`);
  if (!member.bannable || member.roles.highest.comparePositionTo(message.member.roles.highest) > 0) return await message.channel.send(`That person has god mode enabled. What a drag.`);
  const m = await message.client.prompt(message, 'Are you sure you want to ban this user? Respond with **Y**es or **N**o within 30 seconds.');
  if (m === 'Failure') return await message.channel.send(`Operation canceled.`);
  if (m === 'Timeout') return await message.channel.send(`Error: Didn't receive a confirmation. Operation canceled.`);
  if (m !== 'Success') return await message.channel.send(`An error occurred.`);
  const msg = await message.channel.send(`Banning ${user.tag}...`);
  await message.client.case.create({
    type: 'Ban',
    guild: message.guild.id,
    staff: message.author.id,
    reason: reason,
    user: user.id
  });
  await member.ban({
    days: 7,
    reason: `Ban by ${message.author.tag}: ${reason}`
  });
  return await msg.edit(`Banned ${user.tag}`);
}
module.exports.ban = ban;
async function kick(message, member, reason) {
  const user = member.user;
  if (user.id === message.author.id) return await message.channel.send(`The server wouldn't be the same if you kicked yourself.`);
  if (user.id === message.guild.me.id) return await message.channel.send(`I don't deserve that.`);
  if (!member.kickable || member.roles.highest.comparePositionTo(message.member.roles.highest) > 0) return await message.channel.send(`That person has god mode enabled. What a drag.`);
  const m = await message.client.prompt(message, 'Are you sure you want to kick this user? Respond with **Y**es or **N**o within 30 seconds.');
  if (m === 'Failure') return await message.channel.send(`Operation canceled.`);
  if (m === 'Timeout') return await message.channel.send(`Error: Didn't receive a confirmation. Operation canceled.`);
  if (m !== 'Success') return await message.channel.send(`An error occurred.`);
  const msg = await message.channel.send(`Kick ${user.tag}...`);
  await message.client.case.create({
    type: 'Kick',
    guild: message.guild.id,
    staff: message.author.id,
    reason: reason,
    user: user.id
  });
  await member.kick(`Kick by ${message.author.tag}: ${reason}`);
  return await msg.edit(`Kicked ${user.tag}`);
}
module.exports.kick = kick;
async function unmute(message, member, reason) {
  const user = member.user;
  const doc = await message.client.case.muteModel.findOne({
    guild: message.guild.id,
    user: user.id,
    complete: false
  });
  const role = await message.client.redis.get(`mute-${message.guild.id}`);
  console.log(role);
  if (!doc && !member.roles.has(role)) return await message.channel.send(`Error: That person isn't muted.`);
  if (!member.roles.has(role)) return await message.channel.send(`Error: That person isn't muted.`);
  const m = await message.channel.send(`Unmuting ${user.tag}...`);
  const docs = await message.client.case.muteModel.find({
    guild: message.guild.id,
    user: user.id,
    staff: message.author.id,
    complete: false
  });
  if (docs.length === 0) return await m.edit(`Error: There are no open mute cases for this person assigned to you.`);
  var toreturn = false;
  for (const dox of docs) {
    const casee = await message.client.case.fetch({
      guild: dox.guild,
      user: dox.user,
      staff: dox.staff,
      case: dox.case,
      locked: true
    });
    if (casee.staff !== message.author.id) {
      await m.edit(`Error: This is not your case. Wait for it to be unlocked before modifying another staff member's case.`);
      toreturn = true;
      break;
    }
    try {
      await message.client.case.muteModel.findOneAndUpdate({
        guild: dox.guild,
        staff: dox.staff,
        user: dox.user,
        complete: false,
        case: dox.case
      }, {
        $set: {
          duration: 0,
          complete: true
        }
      });
    } catch (e) {
      console.log(e);
      continue;
    }
  }
  if (toreturn) return await m.edit(`Error: An error occurred.`);
  try {
    await member.roles.remove(role);
  } catch (e) {
    return;
  }
  try {
    await message.client.case.create({
      type: 'Unmute',
      guild: message.guild.id,
      staff: message.author.id,
      reason: reason,
      user: user.id
    });
  } catch (e) {
    return console.log(e);
  }
  return await m.edit(`Unmuted ${user.tag}`);

}
module.exports.unmute = unmute;