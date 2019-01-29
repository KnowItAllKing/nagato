const {
  readdir
} = require('fs'), {
  join
} = require('path');
const redis = require('async-redis');

class EventHandler {
  constructor(client, directory) {
    this.client = client;
    this.directory = directory;
    this.redis = redis.createClient();
    this.load();
    this.redis.on("error", err => {
      console.log("Redis error: " + err);
    });
  }
  load() {
    const torequire = join(__dirname, this.directory);
    readdir(torequire, (err, files) => {
      if (err) throw err;
      for (const file of files) {
        if (!file.endsWith('.js')) return;
        const event = require(`${torequire}/${file}`),
          eventName = file.split('.')[0];
        this.client.on(eventName, event.bind(null, this.client, this.redis));
        delete require.cache[require.resolve(`${this.directory}/${file}`)];
      }
    });
  }
}
module.exports = EventHandler;