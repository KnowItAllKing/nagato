const muteSet = new Set();
module.exports = async (client, member) => {
  const mutes = await client.case.muteModel.find({
    guild: member.guild.id,
    complete: false
  });
  for (const mute of mutes) {
    if (mute.user === member.id) {
      const role = await client.redis.get(`mute-${member.guild.id}`) ? await client.redis.get(`mute-${member.guild.id}`) : await client.guild.model.findOne({
        id: member.guild.id
      }).mute;
      if (!role || muteSet.has(member.id)) continue;
      await member.roles.add(role);
      muteSet.add(member.id);
      var doc = await client.case.create({
        type: 'Mute',
        guild: member.guild.id,
        staff: client.user.id,
        reason: `User was muted for an additional 7 days because of attempted mute evasion.`,
        duration: `7d`,
        user: member.id
      });
      try {
        var dox = await client.case.muteModel.findOneAndUpdate({
          guild: member.guild.id,
          user: member.id,
          complete: false
        }, {
          $inc: {
            duration: 604800000
          }
        }, {
          new: true
        });
      } catch (e) {
        return console.log(e);
      }
    }
  } // shou;dn\t it be member.id === mute.user.id doesn't make sense.
} // lol
// huh?
// they have to be the same tho. Indeed.
// what happens if you stringify an array
// member.id and mute.user.id would do the same.
// you mean toStirng()
// same thing yeah
// i think it becomes a string -> ['try', 'this] becomes 'try,this'
// ugh i wanted to cache as much as I could
// i guess this is one of the things I can't right

// yes
// ['a', 'b', 'c'].toString() -> 'a,b,c'