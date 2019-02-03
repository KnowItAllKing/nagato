const CaseModel = require('../../models/Case');
const Guild = require('../../models/Guild');
const {
  MessageEmbed
} = require('discord.js');
class Case {
  constructor(client) {
    this.client = client;
    this.model = CaseModel;
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
    if (options.type === 'Mute') color = '#ffd000';

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
    let toFetch = JSON.parse(await this.client.redis.get(`case${options.case}-${options.guild}`));
    if (!toFetch) {
      try {
        const doc = await CaseModel.findOne(options);
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

    function rgbToHex(rgb) {
      var hex = Number(rgb).toString(16);
      if (hex.length < 2) {
        hex = '0' + hex;
      }
      return hex;
    };

    function fullColorHex(r, g, b) {
      var red = rgbToHex(r);
      var green = rgbToHex(g);
      var blue = rgbToHex(b);
      return red + green + blue;
    };
    for (const doc of docs) {
      if (doc.type === 'Ban') b++;
      if (doc.type === 'Kick' || doc.type === 'Softban') k++;
      if (doc.type === 'Mute') m++;
      if (doc.type === 'Warn') w++;
    }
    const total = w + m + k + b;
    const red = total > 5 ? 255 : total / 5;
    const green = total < 5 ? 255 : total > 7 ? 100 : 200;
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