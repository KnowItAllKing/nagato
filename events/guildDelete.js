const Guild = require('../models/Guild');
module.exports = async (client, guild) => {
  await Guild.findOneAndDelete({
    id: guild.id
  });
  client.redis.del(`${guild.id}`);
  console.log('Bye, ' + guild.name);
}