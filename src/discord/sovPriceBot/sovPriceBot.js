const Discord = require('discord.js');
require('dotenv').config();
import axios from 'axios';
import Web3 from 'web3';
import abiPriceFeed from "../../../config/ABI/abiPriceFeed.json";
const moment = require('moment-timezone');
const config = require('config'),
  _ = require('lodash'),
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
  iSov = 0;
class DiscordPriceBotCtrl {
  async init() {
    bot.once('ready', () => {
      console.log('The SOV Price Bot is in!');
    });

    bot.login(DISCORD_SOV_PRICE_BOT_TOKEN, () => {
      // console.log('price bot logged in')
    });

    bot.on('message', async (message) => {
      if (!config.monitoredChannels.includes(message.channel.name)) {
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
        const price = priceData.price * 100000000,
          time = moment.tz(priceData.lastUpdated, 'UTC'),
          exampleEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Sovryn')
            .setURL(config.urls.sovrynApp)
            .addField('Sats:', `${price}`)
            .addField('Updated:', `${time.format('LL LTS')} UTC`)
            .addField('Last Fetched:', `${lastRan} UTC`);

        await message.channel.send(exampleEmbed);
      }
    });

    bot.on('ready', async () => {
      const GUILD_ID = DISCORD_SOV_PRICE_BOT_CHANNEL_ID,
        guild = await bot.guilds.fetch(GUILD_ID),
        sovFormatter = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',

          // These options are needed to round to whole numbers if that's what you want.
          //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
          //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
        }),
        marketCapFormatter = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
        });

      setInterval(async () => {
        try {
          // axios call here
          priceData = await fetchCurrentPrice();
          lastRan = moment.tz('UTC').format('LL LTS');
          const price = priceData.price * 100000000,
            sovUsdPrice = await getSovUsdPrice(priceData.price),
            sovMarketCap = await getSovMarketCap(sovUsdPrice);
          // Update bot nickname with price

          // rotate sats and usd
          if (iSov % 3 === 0) {
            guild.me.setNickname(`$SOV: ${sovFormatter.format(sovUsdPrice)}`);
            if (iSov === 3) iSov = 0;
          } else {
            guild.me.setNickname(`$SOV: ${price.toLocaleString()} sats`);
          }
          iSov++;

          bot.user.setActivity(
            `MC: ${marketCapFormatter.format(sovMarketCap)}`,
            { type: 'WATCHING' }
          ); // Annoyingly discord has to have something in front of your 'activity'
        } catch (err) {
          console.log(err);
          // Just show something instead of wrong price
          guild.me.setNickname('$SOV: Error Fetching');
        }
      }, TICKER_SPEED);
    });
  }
}

export default new DiscordPriceBotCtrl();

async function fetchCurrentPrice() {
  const response = await axios.get(config.urls.sovCurrentPrice);
  return response.data;
}

async function getSovUsdPrice(sovPrice) {
    const mainNetContracts = {
        BTC_token: "0x542fDA317318eBF1d3DEAf76E0b632741A7e677d",
        USDT_token: "0xEf213441a85DF4d7acBdAe0Cf78004E1e486BB96",
        priceFeed: "0x437AC62769f386b2d238409B7f0a7596d36506e4",
    },
    web3 = new Web3("https://mainnet.sovryn.app/rpc"),
    contractPriceFeed = new web3.eth.Contract(abiPriceFeed, mainNetContracts.priceFeed);
    let price;
    try {
        price = await contractPriceFeed.methods.queryRate(
            Web3.utils.toChecksumAddress(mainNetContracts.BTC_token),
            Web3.utils.toChecksumAddress(mainNetContracts.USDT_token) 
            ).call();
        const btcPrice = parseFloat(Web3.utils.fromWei(price.rate)).toFixed(6);
        return btcPrice * sovPrice;
    } catch(e) {
        console.error(e)
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
