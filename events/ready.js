module.exports = async (client) => {
  console.log(`Logged in as ${client.user.tag}...`);
  try {
    console.log(`Successfully cached ${await client.cacheGuilds()} guild documents.`);
    setInterval(async () => {
      console.log(`Successfully cached ${await client.cacheGuilds()} guild documents.`);
    }, 1.8e+6)
  } catch (e) {
    console.log('Unable to cache guilds.');
    return process.exit();
  }
  try {
    console.log(`Successfully cached ${await client.cacheCases()} cases.`);
    setInterval(async () => {
      console.log(`Successfully cached ${await client.cacheCases()} cases.`);
    }, 1.8e+6)

  } catch (e) {
    console.log('Unable to cache cases.');
    return process.exit();
  }
}