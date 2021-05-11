module.exports = {
  name: 'prune',
  description: 'Prunes N number of messages.',
  args: true,
  usage: '<int>',
  permissions: 'ADMINISTRATOR',
  execute(message, args) {
    const amount = parseInt(args[0]) + 1;

    if (isNaN(amount)) {
      return message.reply("that doesn't seem to be a valid number.");
    } else if (amount <= 1 || amount > 11) {
      message.reply('you need to input a number between 1 and 10');
      return;
    }

    message.channel.bulkDelete(amount, true).catch((err) => {
      console.error(err);
      message.channel.send('There was an error tryig to prune this channel.');
    });
  },
};
