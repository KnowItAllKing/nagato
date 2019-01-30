class Command {
  constructor(options) {
    if (options) Object.assign(this, options);
  }
}
module.exports = Command;