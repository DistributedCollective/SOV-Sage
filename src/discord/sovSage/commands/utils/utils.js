import Web3 from 'web3';
const Discord = require('discord.js');
// const chalk = require("chalk");
const DISCORD_STATS_CHANNEL = process.env.DISCORD_STATS_CHANNEL;

module.exports = {
  name: 'utils',
  description: 'collection of utilities',
  args: true,
  usage: '<channels> || <count> || <checksum>',
  guildOnly: true,
  cooldown: 5,
  async execute(message, args) {
    const subCommand = args.shift();

    switch (subCommand) {
      // case 'name':
      //     name(message, args);
      //     break;
      case 'channels':
        channels(message, args);
        break;
      case 'count':
        count(message, args);
        break;
      case 'checksum':
        checksum(message, args);
        break;
      default:
        message.channel.send(`Arguments: ${args}\nArguments length: ${args.length}`);
        break;
    }
    return;
  },
};

// tells the bot to change its nickname in the channel
// async function name(message, args) {
//     const { guild } = message;
//     const newName = args.join(' ');
//     await message.channel.send(`changing my name to: \`${newName}\``);
//     await guild.me.setNickname(`${newName}`); // change name to...
//     return;
// }

// sends the DISCORD_STATS_CHANNEL a count of all the channels and connected members
// it includes voice channels as well
async function channels(message, args) {
  const { client } = message; // get client aka bot
  let channels = client.channels.cache.array();
  const statsChannel = client.channels.cache.get(DISCORD_STATS_CHANNEL); // needs to be in envrionment
  // console.log(statsChannel);

  const channelsEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Channel List w/ Member Count');
  var channelsDescription = '';
  channels.forEach(function (item, index, array) {
    if (item.parent !== null) {
      const channelName = item.name;
      const channelMemberCount = item.members.size;
      channelsDescription += `${channelName}: ${channelMemberCount}\n`;
    }
  });
  channelsEmbed.setDescription(channelsDescription);

  // await message.channel.send(channelsEmbed);
  await statsChannel.send(`${message.author}`);
  await statsChannel.send(channelsEmbed);
}

// counts the given channel
async function count(message, args) {
  try {
    let channelToCount = args[0];
    let { guild } = message;
    const channel = guild.channels.cache.find((channel) => channel.name === channelToCount);
    const channelName = channel.name;
    const channelMemberCount = channel.members.size;
    await message.channel.send(
      `Counting members in: ${channelName}, there are ${channelMemberCount} connected.`,
    );
  } catch (err) {
    await message.channel.send(`Could not find: ${channelToCount}`);
    console.error(err);
  }
}

async function checksum(message, args) {
  const address = args.shift();
  try {
    const checksummedAddress = Web3.utils.toChecksumAddress(address);
    await message.channel.send(`Proper checksummed address: ${checksummedAddress}`);
  } catch (err) {
    await message.channel.send(`Could not checksum: ${address}`);
    console.error(err);
  }
}