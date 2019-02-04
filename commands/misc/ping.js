module.exports = {
  name: 'ping',
  aliases: ['pong', 'test'],
  description: 'Ping command just for fun :)',
  permission: 'SEND_MESSAGES',
  usage: '`n.ping`',
  execute: async (client, message, args) => {
    return await message.channel.send('Pong!');
  }
}