const Discord = require('discord.js');
require('dotenv').config();
import axios from 'axios'; // enable if using axios to get price
var moment = require('moment-timezone');

const bot = new Discord.Client();

const DISCORD_SOV_PRICE_BOT_TOKEN = process.env.DISCORD_SOV_PRICE_BOT_TOKEN;
const DISCORD_SOV_PRICE_BOT_CHANNEL_ID = process.env.DISCORD_SOV_PRICE_BOT_CHANNEL_ID; // needs to be server channel
const TICKER_SPEED = process.env.TICKER_SPEED || 5000; // update every 3 seconds (if not defined in env)
const SHOW_MC = process.env.SHOW_MC || false; // once we can find market cap set to true and update code

const network =
  (process.argv && process.argv[2] === 'mainnet') || process.env.MODE === 'mainnet'
    ? 'Mainnet'
    : 'Testnet';
const development = process.env.MODE === 'development' ? true : false;

let priceData = {};

class DiscordPriceBotCtrl {
  async init() {
    bot.once('ready', () => {
      console.log('The SOV Price Bot is in!');
    });

    bot.login(DISCORD_SOV_PRICE_BOT_TOKEN, () => {
      // console.log('price bot logged in')
    });

    bot.on('message', async (message) => {
      if (message.content === '$sov') {
        let price = priceData.price * 100000000; // Convert to sats
        let time = moment.tz(priceData.lastUpdated, 'UTC');

        const exampleEmbed = new Discord.MessageEmbed()
          .setColor('#0099ff')
          .setTitle('SOV Price')
          .setURL('https://live.sovryn.app/')
          .addField('Sats:', `${price}`)
          .addField('Updated at:', `${time.format()} UTC`);

        await message.channel.send(exampleEmbed);

      }
    });

    bot.on('ready', async () => {
      const GUILD_ID = DISCORD_SOV_PRICE_BOT_CHANNEL_ID;
      const guild = await bot.guilds.fetch(GUILD_ID);
      setInterval(async () => {
        try {
          // axios call here
          priceData = await fetchCurrentPrice();
          let price = priceData.price * 100000000; // Convert to sats
          guild.me.setNickname(`$SOV: ${price.toLocaleString()} sats`); // Update bot nickname with price
          if (SHOW_MC) {
            let marketCap = '77,081,653.99 USD'; // TODO: can i fetch this?
            bot.user.setActivity(`MC: ${marketCap}`, { type: 'WATCHING' }); // Annoyingly discord has to have something in front of your 'activity'
          }
        } catch (err) {
          console.log(err);
          guild.me.setNickname(`$SOV: Error Fetching`); // Just show something instead of wrong price
        }
      }, TICKER_SPEED);
    });
  }
}

export default new DiscordPriceBotCtrl();

async function fetchCurrentPrice() {
  let url = 'https://backend.sovryn.app/sov/current-price';
  const response = await axios.get(url);
  return response.data;
}
