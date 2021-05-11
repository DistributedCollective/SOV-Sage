// json from file, puppeteer screenshots: https://dev.to/sagar/how-to-capture-screenshots-with-puppeteer-3mb2
// const puppeteer = require('puppeteer');      // Require Puppeteer module
const Discord = require('discord.js');

import axios from 'axios';

module.exports = {
  name: 's',
  description: 'mage related actions',
  args: true,
  usage: '<name>',
  dmOnly: true,
  cooldown: 5,
  async execute(message, args) {
    const subCommand = args.shift();

    switch (subCommand) {
      case 'lpstat':
        usdtBtcSovMining(message, args);
        break;
      case 'sovloot':
        // puppetFetch(message, args);
        break;
      default:
        message.channel.send(`Arguments: ${args}\nArguments length: ${args.length}`);
        break;
    }
    return;
  },
};

// TODO: the asset names in the addFields below are hardcoded,
// they need to be updated to correlate correctly
let usdtBtcSovMining = async (message, args) => {
  if (args.length < 1) {
    return await message.reply('you need to send an address too');
  }
  const walletAddress = args[0];
  const response = await axios.get(`${config.urls.liquidityMining}${walletAddress}`);
  console.log(response.data);
  const exampleEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Liquidity Mining: USDT/BTC Pool')
    .addFields(
      {
        name: 'Asset: USDT',
        value: `Your Current Share Of Reward Pool*: ${response.data[0].percentage}%\nYour Current Share Of Reward Pool*: ${response.data[0].sovReward}`,
        inline: true,
      },
      {
        name: 'Asset: BTC',
        value: `Your Current Share Of Reward Pool*: ${response.data[1].percentage}%\nYour Current Share Of Reward Pool*: ${response.data[1].sovReward}`,
        inline: true,
      },
    );
  await message.channel.send(exampleEmbed);
};

// let puppetFetch = async (message, args) => {
//     // default browser viewport size
//     const defaultViewPort = {
//         width: 1440,
//         height: 1080
//     };

//     const browser = await puppeteer.launch({
//         defaultViewport: defaultViewPort,
//         headless: true,
//         ignoreHTTPSErrors: true
//     });  // Launch a "browser"

//     const url = 'https://wiki.sovryn.app/en/community/tools/sov-btc-usdt-loot-drop';

//     const page = await browser.newPage();      // Open new page
//     // await page.goto(url);                      // Go website
//     // adding the configs b/c screenshot was coming back missing elements
//     await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });

//     await page.waitForSelector('.contents > div:nth-child(1) > div:nth-child(1) > iframe:nth-child(1)');          // wait for the selector to load
//     const element = await page.$('.contents > div:nth-child(1) > div:nth-child(1) > iframe:nth-child(1)');        // declare a variable with an ElementHandle

//     let screenshot = await element.screenshot({'clip': {'x': 580, 'y': 235, 'width': 200, 'height': 230}});

//     // let screenshot = await element.screenshot();

//     await page.close();                        // Close the website
//     await browser.close();
//     const exampleEmbed = new Discord.MessageEmbed()
// 	.setColor('#0099ff')
// 	.setTitle('SOV BTC/USTD Loot Drop')
// 	.setURL(url);
//     message.channel.send(exampleEmbed);
//     // message.channel.send(`BTC Info: ${url}`);
//     message.channel.send({files: [screenshot]});
// }
