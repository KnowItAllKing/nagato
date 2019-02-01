module.exports = async (client) => {
  console.log(`Logged in as ${client.user.tag}...`);
  try {
    console.log(`Successfully cached ${await client.cacheGuilds()} guild documents.`);
  } catch (e) {
    console.log('Unable to cache guilds.');
  }
  try {
    console.log(`Successfully cached ${await client.cacheCases()} cases.`);
  } catch (e) {
    console.log('Unable to cache cases.');
  }
}