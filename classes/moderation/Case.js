const CaseModel = require('../../models/Case');
const Guild = require('../../models/Guild');
const {
  MessageEmbed
} = require('discord.js');
class Case {
  constructor(client) {
    this.client = client;
  }
  async create(options) {
    /*
    options = {
      type: 'Type of case',
      guild: 'ID of guild',
      staff: 'Person who created the case',
      reason: 'Reason of the case',
      user: 'Target of the action'
    };
    */
    const arr = await CaseModel.find({
      guild: options.guild
    });
    let color = '';
    if (options.type === 'Warn') color = '#ffd000';
    if (options.type === 'Kick') color = '#fbff00';
    if (options.type === 'Ban') color = '#ff0000';
    if (options.type === 'Softban') color = '#ff7d00';
    if (options.type === 'Mute') colo = '#ffd000';

    const casenum = arr ? arr.length + 1 : 1,
      user = await this.client.users.fetch(options.user),
      staff = await this.client.users.fetch(options.staff),
      embed = new MessageEmbed()
      .setAuthor(options.type, staff.displayAvatarURL())
      .setDescription(`\`Case #${casenum}\``)
      .addField(`User`, `\`${user.tag} (${options.user})\``, true)
      .addField(`Staff`, `\`${staff.tag} (${options.staff})\``, true)
      .addField(`Reason`, `${options.reason || 'No reason specified. Add one using `n.reason ' + casenum + ' <...reason>`'}`, false)
      .setColor(color)
      .setTimestamp();
    let chan = this.client.channels.get(await this.client.redis.get(`log-${options.guild}`));
    if (!chan) {
      const doc = await Guild.findOne({
        id: options.guild
      });
      chan = this.client.channels.get(doc.log);
      try {
        await this.client.redis.set(`log-${options.guild}`, chan.id);
        console.log(`Cached the uncached log channel ID for ${options.guild}`);
      } catch (e) {}
    }
    const msg = await chan.send(embed);
    const newCase = new CaseModel({
      guild: options.guild,
      staff: options.staff,
      reason: options.reason,
      user: options.user,
      case: casenum,
      message: msg.id,
      channel: chan.id,
      locked: true
    });
    await newCase.save();
    await this.client.redis.set(`case${newCase.case}-${newCase.guild}`, JSON.stringify(newCase));
    return newCase;
  }
  async fetch(options) {
    let toFetch = await this.client.redis.get(`case${options.case}-${options.guild}`);
    if (!toFetch) {
      try {
        toFetch = await CaseModel.findOne(options);
        await this.client.redis.set(`case${options.case}-${options.guild}`);
      } catch (e) {
        return;
      }
    }
    return toFetch;
  }
  async unlock(options) {
    const doc = await CaseModel.findOneAndUpdate(options, {
      $set: {
        locked: false
      }
    }, {
      new: true
    });
    await this.client.redis.set(`case${options.case}-${options.guild}`, doc);
    return doc;
  }

}
module.exports = Case;