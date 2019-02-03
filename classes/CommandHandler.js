const {
  readdir
} = require('fs'), {
  join
} = require('path');
const Command = require('./Command');
class CommandHandler {
  constructor(client, directory) {
    this.client = client;
    this.directory = directory;
    this.load();
  }
  load() {
    const torequire = join(__dirname, this.directory);
    readdir(torequire, (err, folders) => {
      if (err) throw err;
      for (const folder of folders) {
        readdir(join(torequire, folder), (err, files) => {
          if (err) throw err;
          for (const file of files) {
            if (!file.endsWith('.js')) continue;
            const command = new Command(require(`${torequire}/${folder}/${file}`));
            this.client.commands.set(command.name, command);
            command.aliases.forEach(alias => {
              this.client.commands.set(alias, command);
            })
          }
        });
      }
    });
  }
}
module.exports = CommandHandler;