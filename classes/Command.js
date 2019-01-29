class Command {
  constructor(options) {
    if (Object.keys(options).length !== 6) return;
    this.name = options.name;
    this.aliases = options.aliases;
    this.description = options.description;
    this.permissions = options.permissions;
    this.usage = options.usage;
    this.execute = options.execute;
  }
}
module.exports = Command;