import { config } from 'dotenv';

/**
 * SovSage bot
 * took heavy inspiration from: https://discordjs.guide/
 * Discord.JS docs: https://discord.js.org/#/docs/main/stable/general/welcome
 */
const Discord = require('discord.js');
require('dotenv').config();
const fs = require('fs'),
  path = require('path'),
  bot = new Discord.Client(),
  pathToCommands = path.resolve(__dirname, './commands'),
  commandFolders = fs.readdirSync(pathToCommands),
  DISCORD_SOV_SAGE_BOT_TOKEN = process.env.DISCORD_SOV_SAGE_BOT_TOKEN,
  DISCORD_SOV_PRICE_BOT_CHANNEL_ID =
    process.env.DISCORD_SOV_PRICE_BOT_CHANNEL_ID,
  PREFIX = process.env.DISCORD_SOV_SAGE_PREFIX || '!';

bot.commands = new Discord.Collection();
bot.cooldowns = new Discord.Collection();

for (const folder of commandFolders) {
  const commandFiles = fs
    .readdirSync(`${pathToCommands}/${folder}`)
    .filter((file) => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);

    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    bot.commands.set(command.name, command);
  }
}

class DiscordSovSage {
  async init() {
    bot.once('ready', async () => {
      console.log('The Sage is in!');
    });

    bot.login(DISCORD_SOV_SAGE_BOT_TOKEN);

    bot.on('message', async (message) => {
      if (!message.content.startsWith(PREFIX) || message.author.bot) return;
      if (message.channel.type == 'dm') {
        const user = await bot.guilds.cache
            .get(DISCORD_SOV_PRICE_BOT_CHANNEL_ID)
            .members.fetch(message.author.id),
          allowedToDm = user.roles.cache.some((r) =>
            config.allowedRoles.includes(r.name.toLowerCase())
          );
        if (!allowedToDm) return;
      }
      // Check if they have one of many roles, this will need to be opened up if we ever want the general populus to use SOV Sage
      try {
        if (
          !message.member.roles.cache.some((r) =>
            config.allowedRoles.includes(r.name.toLowerCase())
          )
        ) {
          return;
        }
      } catch (err) {
        console.log(err);
        // return;
      }

      // TODO: refactor this
      // Support quoted strings: idea from https://stackoverflow.com/a/57348034
      const regex = new RegExp('"[^"]+"|[\\S]+', 'g'),
        args = [],
        { cooldowns } = bot,
        now = Date.now();

      message.content.match(regex).forEach((element) => {
        if (!element) return;
        return args.push(element.replace(/"/g, ''));
      });

      let commandName, command, timestamps, cooldownAmount;

      commandName = args.shift().toLowerCase().slice(PREFIX.length);

      if (!bot.commands.has(commandName)) return;

      command = bot.commands.get(commandName);

      if (command.guildOnly && message.channel.type === 'dm') {
        return message.reply("I can't execute that type of command in a dm!");
      } else if (command.dmOnly && message.channel.type === 'text') {
        return message.reply(
          'I can only execute that type of command in a dm!'
        );
      }

      // for more info: https://discordjs.guide/command-handling/adding-features.html#command-permissions
      if (command.permissions) {
        const authorPerms = message.channel.permissionsFor(message.author);
        if (!authorPerms || !authorPerms.has(command.permissions)) {
          return message.reply('permissions error');
        }
      }

      if (command.args && !args.length) {
        let reply = `${message.author}, You didn't provide any arguments!`;

        if (command.usage) {
          reply += `\nThe proper usage would be: \`${PREFIX}${command.name} ${command.usage}\``;
        }

        return message.channel.send(reply);
      }

      if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
      }

      timestamps = cooldowns.get(command.name);
      cooldownAmount = (command.cooldown || 2) * 1000;
      if (timestamps.has(message.author.id)) {
        const expirationTime =
          timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          return message.reply(
            `please wait ${timeLeft.toFixed(
              1
            )} more second(s) before reusing the \`${command.name}\` command.`
          );
        }
      }

      timestamps.set(message.author.id, now);
      setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

      try {
        command.execute(message, args);
      } catch (error) {
        console.error(error);
        message.reply('There was an error trying to execute that command.');
      }
    });
  }
}

export default new DiscordSovSage();
