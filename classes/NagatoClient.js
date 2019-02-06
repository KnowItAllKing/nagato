const {
  Client,
  Collection,
  MessageEmbed
} = require('discord.js');
const {
  warn,
  mute,
  softban,
  ban,
  kick,
  unmute
} = require('./functions');
const Case = require('./Case'),
  CaseModel = require('../models/Case'),
  Guild = require('../models/Guild'),
  Mute = require('../models/Mute');
const {
  createClient
} = require('async-redis');
class Nagato extends Client {
  constructor(CommandHandler, EventHandler, token) {
    super();
    this.commands = new Collection();
    this.CommandHandler = new CommandHandler(this, '../commands');
    this.EventHandler = new EventHandler(this, '../events');
    this.redis = createClient();
    this.login(token);
    this.case = new Case(this);
    this.guild = {
      model: Guild
    };
    this.djs = {
      embed: MessageEmbed
    };
    this.redis.on('error', err => console.log('Redis error:\n' + err));
  }
  async warn(message, member, reason) {
    return await warn(message, member, reason);
  }
  async mute(message, member, duration, reason) {
    return await mute(message, member, duration, reason);
  }
  async softban(message, member, reason) {
    return await softban(message, member, reason);
  }
  async ban(message, member, reason) {
    return await ban(message, member, reason);
  }
  async kick(message, member, reason) {
    return await kick(message, member, reason);
  }
  async unmute(message, member, reason) {
    return await unmute(message, member, reason);
  }
  async cacheGuilds() {
    this.guilds.forEach(async guild => {
      try {
        var doc = await Guild.findOne({
          id: guild.id
        });
      } catch (e) {
        return;
      }
      try {
        await this.redis.set(`config-${guild.id}`, JSON.stringify(doc));
        await this.redis.set(`prefix-${guild.id}`, String(doc.prefix));
      } catch (e) {
        return console.log('Unable to cache ' + guild.name);
      }
    });
    return this.guilds.size;
  }
  async cacheCases() {
    const docs = await CaseModel.find();
    var count = 0;
    for (const doc of docs) {
      await this.redis.set(`case${doc.case}-${doc.guild}`, JSON.stringify(doc));
      count++;
    }
    return count;
  }
  async prompt(message, prompt) {
    const success = new RegExp(/(yes|y)/, 'i'),
      failure = new RegExp(/(no|n)/, 'i');
    await message.channel.send(prompt);
    const msgs = await message.channel.awaitMessages(mt => mt.author.id === message.author.id, {
      max: 1,
      time: 20e3
    });
    if (msgs.size === 0) return 'Timeout';
    const confirmation = msgs.first();
    if (failure.test(confirmation.content) || !success.test(confirmation.content)) return 'Failure';
    if (success.test(confirmation.content)) return 'Success';
  }
  async send(channel, message) {
    return await channel.send(message);
  }
  async ensureMutes() {
    const docs = await Mute.find({
      complete: false
    });
    for (const doc of docs) {
      if (doc.duration === 0) continue;
      const guild = this.guilds.get(doc.guild),
        member = guild.members.get(doc.user),
        role = guild.roles.get(await this.redis.get(`mute-${guild.id}`));
      if (!role) continue;
      if (!member.roles.has(role.id)) {
        await member.roles.add(role);
      }
    }
  }
  async countdownMutes() {
    async function doIt(client) {
      const docs = await Mute.find({
        complete: false
      });
      for (const doc of docs) {
        if (doc.duration <= 0) {
          const guild = client.guilds.get(doc.guild),
            member = guild.members.get(doc.user),
            role = await client.redis.get(`mute-${guild.id}`);
          if (!guild || !member || !role) continue;
          await member.roles.remove(role);
          try {
            return await Mute.findOneAndUpdate({
              guild: doc.guild,
              case: doc.case
            }, {
              $set: {
                duration: 0,
                complete: true
              }
            });
          } catch (e) {
            return console.log(e);
          }
        }
        try {
          return await Mute.findOneAndUpdate({
            guild: doc.guild,
            case: doc.case
          }, {
            $inc: {
              duration: -60000
            }
          });
        } catch (e) {
          return console.log(e);
        }
      }
    }
    await doIt(this);
    setInterval(async () => await doIt(this), 60000);
  }
  /*
    async ensureMutes() { 
      const mutes = // 
        mutes.forEach(async mute => { 
          const guild = this.client.guilds.get(mute.guild);
          const role = guild.roles.get(await this.client.redis.get(`mute-${mute.guild}`));
          if (!role) continue;
          const member = guild.members.get(mute.user);
          if (!member.roles.has(role.id))
            try {
              setTimeout(async () => {
                await member.roles.add(role);
              }, 15000);
            } catch (e) {
              return;
            }
        });
    }
  */

}
module.exports = Nagato;