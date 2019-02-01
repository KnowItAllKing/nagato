const {
  Client,
  Collection
} = require('discord.js');
const {
  warn,
  mute
} = require('./moderation/functions');
const Case = require('./moderation/Case'),
  CaseModel = require('../models/Case'),
  Guild = require('../models/Guild');
const redis = require('async-redis');
class Nagato extends Client {
  constructor(CommandHandler, EventHandler, token) {
    super(CommandHandler, EventHandler, token);
    this.commands = new Collection();
    this.CommandHandler = new CommandHandler(this, '../commands');
    this.EventHandler = new EventHandler(this, '../events');
    this.redis = redis.createClient();
    this.login(token);
    this.case = new Case(this);
    this.redis.on("error", err => {
      console.log("Redis error: " + err);
    });
  }
  async warn(message, member, reason) {
    return await warn(message, member, reason);
  }
  async mute(message, member, duration, reason) {
    return await mute(message, member, duration, reason);
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
      if (doc.locked === false) continue;
      await this.redis.set(`case${doc.case}-${doc.guild}`, JSON.stringify(doc));
      count++;
    }
    return count;
  }

}
module.exports = Nagato;