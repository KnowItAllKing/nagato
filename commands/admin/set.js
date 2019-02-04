module.exports = new function () {
  this.name = 'set';
  this.aliases = ['s', 'settings', 'setting', 'config', 'setup'];
  this.description = 'Modify a guild setting. Examples: `n.set prefix n!` `n.set list` `n.set log #log`';
  this.permission = 'ADMINISTRATOR';
  this.usage = '`n.set <setting> <option>`';
  this.execute = async (client, message, args) => {
    if (args[0].toLowerCase().includes('list')) {
      const doc = await client.redis.get(`config-${message.guild.id}`) ? JSON.parse(await client.redis.get(`config-${message.guild.id}`)) : await client.guild.model.findOne({
        id: message.guild.id
      });
      const embed = new client.djs.embed()
        .setAuthor(`Settings Query: ${message.guild.name}`, message.guild.iconURL())
        .addField(`Prefix`, doc.prefix, true)
        .addField(`Log Channel`, `<#${doc.log}>`)
        .setColor(process.env.COLOR);
      return await client.send(message.channel, embed);
    }
    if (args[0].toLowerCase().includes('prefix')) {
      const pref = args.splice(1).join(' ');
      const reg = /[a-zA-Z0-9_]*/;
      if (pref.length > 16 || !reg.test(pref) || pref.includes('`')) return await client.send(message.channel, 'Error: Invalid prefix. The maximum length is 16 characters. Only alphanumeric characters (letters and numbers) and underscores are allowed.');
      const doc = await client.redis.get(`config-${message.guild.id}`) ? JSON.parse(await client.redis.get(`config-${message.guild.id}`)) : await client.guild.model.findOne({
        id: message.guild.id
      });
      const newdoc = await client.guild.model.findOneAndUpdate({
        id: message.guild.id
      }, {
        $set: {
          prefix: pref
        }
      }, {
        new: true
      });
      await client.redis.set(`config-${message.guild.id}`, JSON.stringify(newdoc));
      await client.redis.set(`prefix-${message.guild.id}`, String(newdoc.prefix));
      const embed = new client.djs.embed()
        .setAuthor(`Settings Modification: ${message.guild.name}`, message.guild.iconURL())
        .addField(`Old Prefix`, `\`${doc.prefix}\``, true)
        .addField(`New Prefix`, `\`${newdoc.prefix}\``, true)
        .setColor(process.env.COLOR)
        .setTimestamp();
      return await client.send(message.channel, embed);
    }
    if (args[0].toLowerCase().includes('log')) {
      const chan = message.mentions.channels.size > 0 ? message.mentions.channels.first().id : args[0].length === 18 ? args[0] : null;
      if (!chan) return await client.send(message.channel, 'Error: You must provide a valid channel mention or ID.');
      const doc = await client.redis.get(`config-${message.guild.id}`) ? JSON.parse(await client.redis.get(`config-${message.guild.id}`)) : await client.guild.model.findOne({
        id: message.guild.id
      });
      const newdoc = await client.guild.model.findOneAndUpdate({
        id: message.guild.id
      }, {
        $set: {
          log: chan
        }
      }, {
        new: true
      });
      await client.redis.set(`config-${message.guild.id}`, JSON.stringify(newdoc));
      await client.redis.set(`log-${message.guild.id}`, String(chan));
      const embed = new client.djs.embed()
        .setAuthor(`Settings Modification: ${message.guild.name}`, message.guild.iconURL())
        .addField(`Old Channel`, `${doc.log ? `<#${doc.log}>` : 'None set'}`, true)
        .addField(`New Channel`, `<#${newdoc.log}>`, true)
        .setColor(process.env.COLOR)
        .setTimestamp();
      return await client.send(message.channel, embed);
    }
    client.guild.model.findOne
  }
}