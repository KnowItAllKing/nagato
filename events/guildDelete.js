const Guild = require('../models/Guild');
module.exports = async (client, redis, guild) => {
  await Guild.findOneAndDelete({
    id: guild.id
  });
  redis.del(`${guild.id}`);
  console.log('Bye, ' + guild.name);
}