async function warn(message, member, reason) {
  const user = member.user;
  if (user.id === message.author.id) return await message.channel.send(`You can't warn yourself.`);
  if (user.id === message.guild.me.id) return await message.channel.send(`You can' warn me.`);
  const m = await message.channel.send(`Warning ${user.tag}...`);
  const doc = await message.client.case.create({
    type: 'Warn',
    guild: message.guild.id,
    staff: message.author.id,
    reason: reason,
    user: user.id
  });
  await m.edit(`Warned ${user.tag}`);
  return doc;
}
module.exports.warn = warn;