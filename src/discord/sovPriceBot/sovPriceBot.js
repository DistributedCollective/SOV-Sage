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
  TICKER_SPEED = process.env.TICKER_SPEED || 5000;
// const SHOW_MC = process.env.SHOW_MC || false; // once we can find market cap set to true and update code

// const network =
//   (process.argv && process.argv[2] === 'mainnet') || process.env.MODE === 'mainnet'
//     ? 'Mainnet'
//     : 'Testnet';
// const development = process.env.MODE === 'development' ? true : false;

let priceData = {},
  lastRan,
  iSov = 0,
  sovMarketCap = {},
  lastSovMarketCap = {},
  sovUsdPrice = {},
  price = 0.0,
  lastPrice = 0.0;
class DiscordPriceBotCtrl {
  async init() {
    bot.once('ready', () => {
      console.log('The SOV Price Bot is in!');
    });

    bot.login(DISCORD_SOV_PRICE_BOT_TOKEN, () => {
      // console.log('price bot logged in')
    });

    bot.on('ready', async () => {
      const GUILD_ID = DISCORD_SOV_PRICE_BOT_CHANNEL_ID,
        guild = await bot.guilds.fetch(GUILD_ID),
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

        priceData = await fetchCurrentPrice();

        const jobUpdateDiscord = schedule.scheduleJob('*/10 * * * * *', async function(){
            if (!guild.me.hasPermission('MANAGE_NICKNAMES')) {
                return console.log('I don\'t have permission to change nickname!');
            }

            price = priceData.price * 100000000;

            if (price != lastPrice) {
                let nickname = `$SOV: ${price.toLocaleString()} sats`;
                let res = await guild.me.setNickname(nickname).catch(console.log);
                // console.log(res);
                lastPrice = price;
                // console.log('price has changed, updating');
            }
            
            // console.log(sovMarketCap);
            // console.log(lastSovMarketCap);
            if (sovMarketCap != lastSovMarketCap) {
                // console.log('Updating SOV Market Cap');
                await bot.user.setActivity(
                    `MC: ${marketCapFormatter.format(sovMarketCap)}`,
                    { type: 'WATCHING' }
                ); // Annoyingly discord has to have something in front of your 'activity'
                lastSovMarketCap = sovMarketCap;
            }

            // try {
            //     // axios call here
            //     // Update bot nickname with price
            //     const price = priceData.price * 100000000;
      
            //     // rotate sats and usd
            //     if (iSov % 3 === 0) {
            //         console.log('here');
            //       let res1 = await guild.me.setNickname(`$SOV: ${sovFormatter.format(sovUsdPrice)}`);
            //       console.log(res1);
            //       if (iSov === 3) iSov = 0;
            //     } else {
            //         console.log('there');
            //         let res2 = guild.me.setNickname(`$SOV: ${price.toLocaleString()} sats`);
            //         console.log(res2);
            //     }
            //     iSov++;
      
            //     bot.user.setActivity(
            //       `MC: ${marketCapFormatter.format(sovMarketCap)}`,
            //       { type: 'WATCHING' }
            //     ); // Annoyingly discord has to have something in front of your 'activity'
            //   } catch (err) {
            //     console.log(err);
            //     // Just show something instead of wrong price
            //     guild.me.setNickname('$SOV: Error Fetching');
            //   }
        });

    });
  }
}

export default new DiscordPriceBotCtrl();

async function fetchCurrentPrice() {
  const response = await axios.get(config.urls.sovCurrentPrice);
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
    const btcPrice = parseFloat(Web3.utils.fromWei(price.rate)).toFixed(6);
    return btcPrice * sovPrice;
  } catch (e) {
    console.log(e);
  }
  return undefined;
}

async function getSovMarketCap(currentPrice) {
  // circ supply * current price
  const sovCirculatingSupply = await axios.get(
      config.urls.sovCirculatingSupply
    ),
    marketCap = sovCirculatingSupply.data.circulating_supply * currentPrice;
  return marketCap;
}

const job = schedule.scheduleJob('*/10 * * * * *', async function(){
    priceData = await fetchCurrentPrice();
    // console.log(priceData);
});

const job2 = schedule.scheduleJob('*/10 * * * * *', async function(){
    sovMarketCap = await getSovMarketCap(sovUsdPrice);
    // console.log(sovMarketCap);
});

const job3 = schedule.scheduleJob('*/10 * * * * *', async function(){
    sovUsdPrice = await getSovUsdPrice(priceData.price);
    // console.log(sovUsdPrice);
});
