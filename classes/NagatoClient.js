const {
  Client,
  Collection
} = require('discord.js');
class Nagato extends Client {
  constructor(CommandHandler, EventHandler, token) {
    super(CommandHandler, EventHandler, token);
    this.commands = new Collection();
    this.CommandHandler = new CommandHandler(this, '../commands');
    this.EventHandler = new EventHandler(this, '../events');
    this.login(token);
  }
}
module.exports = Nagato;