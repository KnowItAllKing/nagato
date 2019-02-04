const CaseModel = require('../models/Case');
const Guild = require('../models/Guild');
const sprintf = require('sprintf-js').sprintf;
const {
  MessageEmbed
} = require('discord.js');
class Case {
  constructor(client) {
    this.client = client;
    this.model = CaseModel;
  }
  get(type) {
    let color = '';
    if (type === 'Warn') color = '#ffd000';
    if (type === 'Kick') color = '#fbff00';
    if (type === 'Ban') color = '#ff0000';
    if (type === 'Softban') color = '#ff7d00';
    if (type === 'Mute') color = '#ffd000';
    return color;
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
    const color = this.get(options.type);

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
      if (!chan) chan = null;
      try {
        await this.client.redis.set(`log-${options.guild}`, chan.id);
        console.log(`Cached the uncached log channel ID for ${options.guild}`);
      } catch (e) {}

    }
    const msg = chan ? await chan.send(embed) : null;
    const newCase = new CaseModel({
      guild: options.guild,
      staff: options.staff,
      type: options.type,
      reason: options.reason,
      user: options.user,
      case: casenum,
      message: chan ? msg.id : null,
      channel: chan ? chan.id : null,
      locked: true
    });
    await newCase.save();
    await this.client.redis.set(`case${newCase.case}-${newCase.guild}`, JSON.stringify(newCase));
    return newCase;
  }
  async fetch(options) {
    if (typeof options.case !== 'number') return null;
    let toFetch = JSON.parse(await this.client.redis.get(`case${options.case}-${options.guild}`));
    if (!toFetch) {
      try {
        const doc = await CaseModel.findOne(options);
        if (!doc) return null;
        await this.client.redis.set(`case${options.case}-${options.guild}`, JSON.stringify(doc));
        return doc;
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
    await this.client.redis.set(`case${options.case}-${options.guild}`, JSON.stringify(doc));
    return doc;
  }
  async checkHistory(options) {
    const docs = await CaseModel.find({
      guild: options.guild,
      user: options.user
    });
    var w = 0,
      m = 0,
      k = 0,
      b = 0;

    function fullColorHex(r, g, b) {
      const ri = Math.round(r) * 256 * 256;
      const gi = Math.round(g) * 256;
      const bi = Math.round(b);
      const retnum = (ri + gi + bi);
      const retstring = sprintf("%06x", retnum);
      return retstring;
    };
    for (const doc of docs) {
      if (doc.type === 'Ban') b++;
      if (doc.type === 'Kick' || doc.type === 'Softban') k++;
      if (doc.type === 'Mute') m++;
      if (doc.type === 'Warn') w++;
    }
    const total = w + m + k + b;
    const scalemax = 10;
    const red = total > scalemax ? 255 : (total / scalemax) * 255;
    const green = total > scalemax ? 0 : (1 - total / scalemax) * 255;
    const rgb = [red, green, 0];
    const c = fullColorHex(rgb[0], rgb[1], rgb[2]);
    return {
      color: c,
      warnings: w,
      mutes: m,
      kicks: k,
      bans: b
    };
  }
}
module.exports = Case;