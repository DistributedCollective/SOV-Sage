require('dotenv').config();

const config = require('config');

module.exports = {
  name: 'h',
  description: 'List all of my commands or info about a specific command.',
  aliases: ['commands'],
  usage: '[command name]',
  cooldown: 5,
  execute(message, args) {
    const data = [],
      { commands } = message.client;

    if (!args.length) {
      data.push("Here is a list of all the Sage's commands:");
      data.push(
        commands
          .map((command) => command.name)
          .sort()
          .join(', ')
      );
      data.push(
        `\nYou can send \`${config.prefix}h [command name]\` to get info on a specific command!`
      );

      return (
        message.channel
          .send(data, { split: true })
          // .then(() => {
          //   if (message.channel.type === 'dm') return;
          //   message.reply("I've sent you a DM with all my commands!");
          // })
          .catch((error) => {
            console.error(
              `Could not send help DM to ${message.author.tag}.\n`,
              error
            );
            message.reply(
              "it seems like I can't DM you! Do you have DMs disabled?"
            );
          })
      );
    }

    let name = args[0].toLowerCase(),
      command =
        commands.get(name) ||
        commands.find((c) => c.aliases && c.aliases.includes(name));

    if (!command) {
      return message.reply("that's not a valid command!");
    }

    data.push(`**Name:** ${command.name}`);

    if (command.aliases)
      data.push(`**Aliases:** ${command.aliases.join(', ')}`);
    if (command.description)
      data.push(`**Description:** ${command.description}`);
    if (command.usage)
      data.push(`**Usage:** ${config.prefix}${command.name} ${command.usage}`);

    data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

    message.channel.send(data, { split: true });
  },
};
