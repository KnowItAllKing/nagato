const {
  Client,
  Collection
} = require('discord.js');
const {
  warn
} = require('./moderation/functions');
const Case = require('./moderation/Case');
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
}
module.exports = Nagato;