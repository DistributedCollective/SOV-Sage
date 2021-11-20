const Discord = require('discord.js');
require('dotenv').config();
import axios from 'axios';
import Web3 from 'web3';
import abiPriceFeed from '../../../config/ABI/abiPriceFeed.json';
const moment = require('moment-timezone'),
  schedule = require('node-schedule');
const config = require('config'),
  bot = new Discord.Client(),
  DISCORD_SOV_PRICE_BOT_TOKEN = process.env.DISCORD_SOV_PRICE_BOT_TOKEN,
  // needs to be server channel
  DISCORD_SOV_PRICE_BOT_CHANNEL_ID =
    process.env.DISCORD_SOV_PRICE_BOT_CHANNEL_ID,
  // update every 5 seconds (if not defined in env)
  //   TICKER_SPEED = process.env.TICKER_SPEED || 5000,
  sovFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }),
  marketCapFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
// const SHOW_MC = process.env.SHOW_MC || false; // once we can find market cap set to true and update code

// const network =
//   (process.argv && process.argv[2] === 'mainnet') || process.env.MODE === 'mainnet'
//     ? 'Mainnet'
//     : 'Testnet';
// const development = process.env.MODE === 'development' ? true : false;

let priceData = {},
  lastRan,
  //   iSov = 0,
  sovMarketCap = {},
  lastSovMarketCap = {},
  sovUsdPrice = {},
  price = 0.0,
  lastPrice = 0.0,
  nickname,
  showInUSD = true,
  btcPrice;
class DiscordPriceBotCtrl {
  async init() {
    bot.once('ready', () => {
      console.log('The SOV Price Bot is in!');
    });

    bot.login(DISCORD_SOV_PRICE_BOT_TOKEN, () => {
      // console.log('price bot logged in')
    });

    bot.on('message', async (message) => {
      if (
        message.channel.type == 'text' &&
        !config.monitoredChannels.includes(message.channel.id)
      ) {
        return;
      }

      //   if (message.channel.type == 'dm') {
      //     const user = await bot.guilds.cache
      //         .get(DISCORD_SOV_PRICE_BOT_CHANNEL_ID)
      //         .members.fetch(message.author.id),
      //       allowedToDm = user.roles.cache.some((r) =>
      //         config.allowedRoles.includes(r.name.toLowerCase())
      //       );
      //     if (!allowedToDm) return;
      //   }
      if (message.content === '$sov') {
        // Convert to sats
        const time = moment.tz(priceData.lastUpdated, 'UTC'),
          exampleEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Sovryn')
            .setURL(config.urls.sovrynApp)
            .addField('BTC:', `${sovFormatter.format(btcPrice)}`, true)
            .addField('SOV:', `${sovFormatter.format(sovUsdPrice)}`, true)
            .addField('SOV:', `${price} sats`, true)
            .addField('Updated:', `${time.format('LL LTS')} UTC`)
            .addField('Last Fetched:', `${lastRan} UTC`);

        await message.channel.send(exampleEmbed);
      }
    });

    bot.on('ready', async () => {
      const GUILD_ID = DISCORD_SOV_PRICE_BOT_CHANNEL_ID,
        guild = await bot.guilds.fetch(GUILD_ID);

      priceData = await fetchCurrentPrice();

      schedule.scheduleJob('*/10 * * * * *', async function () {
        if (!guild.me.hasPermission('MANAGE_NICKNAMES')) {
          return console.log("I don't have permission to change nickname!");
        }

        price = priceData.price * 100000000;

        if (price != lastPrice) {
          if (showInUSD) {
            if (isNaN(sovUsdPrice)) {
              nickname = `Fetching...`;
            } else {
              nickname = `${sovFormatter.format(sovUsdPrice)}`;
            }
          } else if (!isNaN(price)) {
            nickname = `${price.toLocaleString()} sats`;
          } else {
            nickname = `Fetching...`;
          }
          await guild.me.setNickname(`$SOV: ${nickname}`).catch(console.log);
          lastPrice = price;
        }

        // console.log(sovMarketCap);
        // console.log(lastSovMarketCap);
        if (sovMarketCap != lastSovMarketCap) {
          let activity;
          if (isNaN(sovMarketCap)) {
            activity = `MC: Fetching...`;
          } else {
            activity = `MC: ${marketCapFormatter.format(sovMarketCap)}`;
          }
          await bot.user.setActivity(activity, { type: 'WATCHING' }); // Annoyingly discord has to have something in front of your 'activity'
          lastSovMarketCap = sovMarketCap;
        }
      });
    });
  }
}

export default new DiscordPriceBotCtrl();

async function fetchCurrentPrice() {
  const response = await axios
    .get(config.urls.sovCurrentPrice)
    .catch(function (error) {
      if (error.response) {
        // Request made and server responded
        console.log(error.response.data);
        //   console.log(error.response.status);
        //   console.log(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
      }
      response.data = 'error'; // if there is an error the promise fails, least return something in r.d
    });
  lastRan = moment.tz('UTC').format('LL LTS');
  return response.data;
}

async function getSovUsdPrice(sovPrice) {
  const web3 = new Web3(config.urls.mainnetRpc),
    contractPriceFeed = new web3.eth.Contract(
      abiPriceFeed,
      config.mainNetContracts.priceFeed
    );
  let price;
  try {
    price = await contractPriceFeed.methods
      .queryRate(
        Web3.utils.toChecksumAddress(config.mainNetContracts.BTC_token),
        Web3.utils.toChecksumAddress(config.mainNetContracts.USDT_token)
      )
      .call();
    btcPrice = parseFloat(Web3.utils.fromWei(price.rate)).toFixed(6);
    return btcPrice * sovPrice;
  } catch (e) {
    console.log(e);
  }
  return undefined;
}

async function getSovMarketCap(currentPrice) {
  // circ supply * current price
  const sovCirculatingSupply = await axios
      .get(config.urls.sovCirculatingSupply)
      .catch(function (error) {
        if (error.response) {
          // Request made and server responded
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message);
        }
      }),
    marketCap = sovCirculatingSupply.data.circulating_supply * currentPrice;
  return marketCap;
}

schedule.scheduleJob('*/10 * * * * *', async function () {
  priceData = await fetchCurrentPrice();
  // console.log(priceData);
});

schedule.scheduleJob('*/10 * * * * *', async function () {
  sovMarketCap = await getSovMarketCap(sovUsdPrice);
  // console.log(sovMarketCap);
});

schedule.scheduleJob('*/10 * * * * *', async function () {
  sovUsdPrice = await getSovUsdPrice(priceData.price);
  // console.log(sovUsdPrice);
});
