import Web3 from 'web3';
const Discord = require('discord.js'),
  // const chalk = require("chalk");
  DISCORD_STATS_CHANNEL = process.env.DISCORD_STATS_CHANNEL;

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
        message.channel.send(
          `Arguments: ${args}\nArguments length: ${args.length}`
        );
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
async function channels(message) {
  const { client } = message,
    channelList = client.channels.cache.array(),
    statsChannel = client.channels.cache.get(DISCORD_STATS_CHANNEL),
    // console.log(statsChannel);

    channelsEmbed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Channel List w/ Member Count');
  let channelsDescription = '';
  channelList.forEach(function (item) {
    if (item.parent !== null) {
      const channelName = item.name,
        channelMemberCount = item.members.size;
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
  const channelRequestedToCount = args[0];
  try {
    const { guild } = message,
      channelToCount = guild.channels.cache.find(
        (channel) => channel.name === channelRequestedToCount
      ),
      channelName = channelToCount.name,
      channelMemberCount = channelToCount.members.size;
    await message.channel.send(
      `Counting members in: ${channelName}, there are ${channelMemberCount} connected.`
    );
  } catch (err) {
    await message.channel.send(`Could not find: ${channelRequestedToCount}`);
    console.error(err);
  }
}

async function checksum(message, args) {
  const address = args.shift();
  try {
    const checksummedAddress = Web3.utils.toChecksumAddress(address);
    await message.channel.send(
      `Proper checksummed address: ${checksummedAddress}`
    );
  } catch (err) {
    await message.channel.send(`Could not checksum: ${address}`);
    console.error(err);
  }
}
